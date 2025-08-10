
'use client';

import { Book, History, HelpCircle, Settings, Loader2, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState, useTransition, useEffect, useMemo } from 'react';
import { requestBook } from '@/ai/flows/request-book-flow';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { type BorrowedBook, type UserProfile } from '@/services/user-service';
import { getBook, type Book as BookType } from '@/services/book-service';
import { format } from 'date-fns';
import { ChartContainer, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';


type PopulatedBorrowedBook = BorrowedBook & {
  title: string;
  author: string;
  category: string;
};

const requestFormSchema = z.object({
  title: z.string().min(3, { message: 'Book title must be at least 3 characters.' }),
  reason: z.string().min(10, { message: 'Please provide a reason of at least 10 characters.' }),
});

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function DashboardPage() {
  const router = useRouter();
  const { user, userProfile, isStudent, isLoading: isAuthLoading } = useAuth();
  const [borrowedBooks, setBorrowedBooks] = useState<PopulatedBorrowedBook[]>([]);
  const [historyBooks, setHistoryBooks] = useState<PopulatedBorrowedBook[]>([]);
  const [isBookDataLoading, setIsBookDataLoading] = useState(true);
  const [isRequestPending, startRequestTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        router.push('/login');
      } else if (!isStudent) {
        router.push('/admin');
      }
    }
  }, [user, isStudent, isAuthLoading, router]);

  useEffect(() => {
    if (!user) return;

    setIsBookDataLoading(true);
    const userDocRef = doc(db, 'users', user.uid);

    const unsubscribe = onSnapshot(userDocRef, async (doc) => {
      const userProfile = doc.data() as UserProfile;
      
      if (!userProfile?.borrowedBooks) {
        setBorrowedBooks([]);
        setHistoryBooks([]);
        setIsBookDataLoading(false);
        return;
      }
      
      try {
        const populatedBooks = await Promise.all(
          userProfile.borrowedBooks.map(async (b) => {
            const bookInfo = await getBook(b.bookId);
            return { 
                ...b, 
                title: bookInfo?.title ?? 'Unknown', 
                author: bookInfo?.author ?? 'Unknown', 
                category: bookInfo?.category ?? 'Unknown' 
            };
          })
        );
        setBorrowedBooks(populatedBooks.filter(b => b.status === 'borrowed'));
        setHistoryBooks(populatedBooks.filter(b => b.status === 'returned'));
      } catch (error) {
        console.error("Failed to populate book details:", error);
        setBorrowedBooks([]);
        setHistoryBooks([]);
      } finally {
        setIsBookDataLoading(false);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const form = useForm<z.infer<typeof requestFormSchema>>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      title: "",
      reason: "",
    },
  });

  const onSubmit = (values: z.infer<typeof requestFormSchema>) => {
    if (!user || !userProfile) return;
    startRequestTransition(async () => {
      try {
        const result = await requestBook({
            ...values,
            userId: user.uid,
            userName: userProfile.name,
        });
        if (result.success) {
          toast({
            title: "Request Submitted",
            description: result.message,
          });
          form.reset();
        } else {
           toast({
            title: "Request Failed",
            description: result.message,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Failed to submit request:", error);
         toast({
            title: "An Error Occurred",
            description: "Could not submit your book request. Please try again later.",
            variant: "destructive",
          });
      }
    });
  }

  const categoryData = useMemo(() => {
    if (!historyBooks.length) return [];
    const counts: { [key: string]: number } = {};
    historyBooks.forEach(book => {
        counts[book.category] = (counts[book.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value], index) => ({ name, value, fill: COLORS[index % COLORS.length] }));
  }, [historyBooks]);
  

  if (isAuthLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-primary">Student Dashboard</h1>
          <p className="text-lg text-muted-foreground">Welcome back, {user.displayName || 'Student'}.</p>
        </div>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/dashboard/settings">
            <Settings className="mr-2 h-4 w-4" />
            Profile Settings
          </Link>
        </Button>
      </header>
      <Tabs defaultValue="borrowed" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 max-w-xl">
          <TabsTrigger value="borrowed"><Book className="mr-2 h-4 w-4" />Borrowed</TabsTrigger>
          <TabsTrigger value="history"><History className="mr-2 h-4 w-4" />History</TabsTrigger>
          <TabsTrigger value="stats"><BarChart2 className="mr-2 h-4 w-4" />Stats</TabsTrigger>
          <TabsTrigger value="requests"><HelpCircle className="mr-2 h-4 w-4" />Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="borrowed" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Currently Borrowed</CardTitle>
              <CardDescription>These are the books you have checked out. Please return them by the due date.</CardDescription>
            </CardHeader>
            <CardContent>
               {isBookDataLoading ? <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin"/></div> : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead className="hidden sm:table-cell">Author</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {borrowedBooks.length > 0 ? borrowedBooks.map(book => (
                          <TableRow key={book.bookId}>
                            <TableCell className="font-medium">{book.title}</TableCell>
                            <TableCell className="hidden sm:table-cell">{book.author}</TableCell>
                            <TableCell>{format(book.dueDate.toDate(), 'PPP')}</TableCell>
                            <TableCell className="text-right">
                              <Button asChild variant="outline" size="sm" className="mr-2"><Link href={`/book/${book.bookId}`}>View Details</Link></Button>
                            </TableCell>
                          </TableRow>
                        )) : (
                          <TableRow>
                              <TableCell colSpan={4} className="text-center h-24">You have no borrowed books.</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
               )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Borrowing History</CardTitle>
              <CardDescription>A record of all the books you've borrowed in the past.</CardDescription>
            </CardHeader>
            <CardContent>
              {isBookDataLoading ? <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin"/></div> : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead className="hidden sm:table-cell">Author</TableHead>
                          <TableHead>Return Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historyBooks.length > 0 ? historyBooks.map(book => (
                          <TableRow key={book.bookId}>
                            <TableCell className="font-medium">{book.title}</TableCell>
                            <TableCell className="hidden sm:table-cell">{book.author}</TableCell>
                            <TableCell>{book.returnedDate ? format(book.returnedDate.toDate(), 'PPP') : 'N/A'}</TableCell>
                            <TableCell className="text-right">
                              <Button asChild variant="outline" size="sm"><Link href={`/book/${book.bookId}`}>Borrow Again</Link></Button>
                            </TableCell>
                          </TableRow>
                        )) : (
                          <TableRow>
                              <TableCell colSpan={4} className="text-center h-24">You have no borrowing history.</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="stats" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Your Reading Stats</CardTitle>
                    <CardDescription>An overview of your reading habits.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <div className="flex flex-col justify-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-3 rounded-full">
                                <Book className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-muted-foreground">Total Books Read</p>
                                <p className="text-2xl font-bold">{historyBooks.length}</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-3 rounded-full">
                                <History className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-muted-foreground">Currently Borrowed</p>
                                <p className="text-2xl font-bold">{borrowedBooks.length}</p>
                            </div>
                        </div>
                    </div>
                    <div>
                         {historyBooks.length > 0 ? (
                            <ChartContainer config={{}} className="min-h-[250px] w-full">
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                         ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-muted rounded-lg min-h-[250px]">
                                <p className="font-semibold">No Reading History Yet</p>
                                <p className="text-sm text-muted-foreground">Your genre breakdown will appear here once you've returned a book.</p>
                            </div>
                         )}
                    </div>
                </CardContent>
            </Card>
         </TabsContent>
        <TabsContent value="requests" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Request a New Book</CardTitle>
              <CardDescription>Can't find a book you're looking for? Request it here!</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                   <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Book Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 'The Lord of the Rings'" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason for Request</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., 'This book is essential for my research project on...'"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isRequestPending}>
                    {isRequestPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Request
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    
