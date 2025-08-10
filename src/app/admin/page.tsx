
'use client';

import { Loader2, PlusCircle, Book, Users, BarChart, FileQuestion, Archive } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { BarChart as RechartsBarChart, PieChart, Pie, Cell, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar } from 'recharts';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo, useTransition } from 'react';
import { getBooks, type Book as BookType, getBookRequests, type BookRequest, archiveBookRequest } from '@/services/book-service';
import { AddBookDialog } from '@/app/add-book-dialog';
import { EditBookDialog } from '@/components/edit-book-dialog';
import { DeleteBookDialog } from '@/components/delete-book-dialog';
import { getUsers, UserProfile } from '@/services/user-service';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const chartData = [
    { month: 'January', borrows: 186, signups: 80 },
    { month: 'February', borrows: 305, signups: 200 },
    { month: 'March', borrows: 237, signups: 120 },
    { month: 'April', borrows: 273, signups: 190 },
    { month: 'May', borrows: 209, signups: 130 },
    { month: 'June', borrows: 214, signups: 140 },
];

const chartConfig: ChartConfig = {
    borrows: { label: 'Borrows', color: 'hsl(var(--chart-1))' },
    signups: { label: 'Signups', color: 'hsl(var(--chart-2))' },
};

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isStudent, isLoading } = useAuth();
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [books, setBooks] = useState<BookType[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [isArchivePending, startArchiveTransition] = useTransition();
  const { toast } = useToast();

  const fetchData = async () => {
    setIsDataLoading(true);
    try {
      const [booksData, usersData, requestsData] = await Promise.all([
        getBooks(), 
        getUsers(),
        getBookRequests()
      ]);
      setBooks(booksData);
      setUsers(usersData);
      setRequests(requestsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsDataLoading(false);
    }
  }
  
  useEffect(() => {
    if (!isLoading) {
      if (!user || isStudent) {
        router.push(isStudent ? '/dashboard' : '/login');
      } else {
        fetchData();
      }
    }
  }, [user, isStudent, isLoading, router]);
  
  const categoryData = useMemo(() => {
    const counts: { [key: string]: number } = {};
    books.forEach(book => {
        counts[book.category] = (counts[book.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value], index) => ({ name, value, fill: COLORS[index % COLORS.length] }));
  }, [books]);

  const handleArchiveRequest = (id: string) => {
    startArchiveTransition(async () => {
        try {
            await archiveBookRequest(id);
            toast({ title: "Request Archived", description: "The book request has been moved to the archive." });
            setRequests(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            console.error("Failed to archive request", error);
            toast({ title: "Error", description: "Could not archive the request.", variant: "destructive" });
        }
    });
  }

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-primary">Admin Dashboard</h1>
          <p className="text-lg text-muted-foreground">Manage your digital library resources.</p>
        </div>
        <AddBookDialog onBookAdded={fetchData}>
            <Button className="mt-4 md:mt-0">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Book
            </Button>
        </AddBookDialog>
      </header>
       <section className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Books</CardTitle>
                  <Book className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{isDataLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : books.length}</div>
                  <p className="text-xs text-muted-foreground">in the entire catalog</p>
              </CardContent>
          </Card>
           <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{isDataLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : users.length}</div>
                   <p className="text-xs text-muted-foreground">{users.filter(u => u.role === 'student').length} students, {users.filter(u => u.role !== 'student').length} staff</p>
              </CardContent>
          </Card>
           <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                    <FileQuestion className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{isDataLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : requests.length}</div>
                    <p className="text-xs text-muted-foreground">new book requests from students</p>
                </CardContent>
           </Card>
           <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Activity</CardTitle>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{isDataLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : '+573'}</div>
                  <p className="text-xs text-muted-foreground">+201 since last month</p>
              </CardContent>
          </Card>
      </section>

       <section className="mb-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Breakdown of books by genre.</CardDescription>
          </CardHeader>
          <CardContent>
             {isDataLoading ? (
                 <div className="flex justify-center items-center p-8 min-h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 </div>
              ) : (
                <ChartContainer config={{}} className="min-h-[300px] w-full">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip content={<ChartTooltipContent hideLabel />} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
             )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Library Activity Overview</CardTitle>
            <CardDescription>Monthly borrows and new user signups.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
              <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={chartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="borrows" fill="var(--color-borrows)" radius={4} />
                    <Bar dataKey="signups" fill="var(--color-signups)" radius={4} />
                  </RechartsBarChart>
              </ResponsiveContainer>
             </ChartContainer>
          </CardContent>
        </Card>
      </section>

      <Tabs defaultValue="books">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="books"><Book className="mr-2 h-4 w-4" />Book Management</TabsTrigger>
          <TabsTrigger value="users"><Users className="mr-2 h-4 w-4" />User Management</TabsTrigger>
          <TabsTrigger value="requests"><FileQuestion className="mr-2 h-4 w-4" />Book Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="books" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Books</CardTitle>
              <CardDescription>Upload, categorize, or delete ebooks from the library.</CardDescription>
            </CardHeader>
            <CardContent>
              {isDataLoading ? (
                 <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 </div>
              ) : (
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Copies</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {books.map((book) => (
                      <TableRow key={book.id}>
                        <TableCell className="font-medium">{book.title}</TableCell>
                        <TableCell>{book.author}</TableCell>
                        <TableCell><Badge variant="secondary">{book.category}</Badge></TableCell>
                        <TableCell>{book.availableCopies}/{book.totalCopies}</TableCell>
                        <TableCell className="text-right">
                           <EditBookDialog book={book} onBookEdited={fetchData}>
                            <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                          </EditBookDialog>
                          <DeleteBookDialog bookId={book.id} bookTitle={book.title} onBookDeleted={fetchData}>
                            <Button variant="destructive" size="sm">Delete</Button>
                          </DeleteBookDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Users</CardTitle>
              <CardDescription>View and manage all registered users.</CardDescription>
            </CardHeader>
            <CardContent>
               {isDataLoading ? (
                 <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 </div>
              ) : (
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.uid}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role.includes('staff') || user.role.includes('admin') || user.role.includes('librarian') ? 'default' : 'outline'}>{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                            {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="requests" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Book Requests</CardTitle>
              <CardDescription>View and manage book requests submitted by students.</CardDescription>
            </CardHeader>
            <CardContent>
               {isDataLoading ? (
                 <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 </div>
              ) : (
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book Title</TableHead>
                      <TableHead>Requested By</TableHead>
                      <TableHead>Reason</TableHead>
                       <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.length > 0 ? requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.title}</TableCell>
                        <TableCell>{request.userName}</TableCell>
                        <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                        <TableCell>{formatDistanceToNow(request.createdAt.toDate(), { addSuffix: true })}</TableCell>
                        <TableCell className="text-right">
                            <Button variant="outline" size="sm" onClick={() => handleArchiveRequest(request.id!)} disabled={isArchivePending}>
                                {isArchivePending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
                                <span className="sr-only">Archive</span>
                            </Button>
                        </TableCell>
                      </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">No pending book requests.</TableCell>
                        </TableRow>
                    )}
                  </TableBody>
                </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    
