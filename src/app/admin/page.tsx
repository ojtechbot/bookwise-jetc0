
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
import { useEffect, useState, useMemo } from 'react';
import { type BookRequest, archiveBookRequest, getBookRequests } from '@/services/book-service';
import { AddBookDialog } from '@/app/add-book-dialog';
import { EditBookDialog } from '@/components/edit-book-dialog';
import { DeleteBookDialog } from '@/components/delete-book-dialog';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { EditUserDialog } from '@/components/edit-user-dialog';
import allBooksData from '@/data/books.json';
import allUsersData from '@/data/users.json';
import { type Book as BookType, type Book as UserProfile } from '@/services/book-service';


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
  
  // Use static JSON data
  const books: BookType[] = useMemo(() => allBooksData as unknown as BookType[], []);
  const users: UserProfile[] = useMemo(() => allUsersData as unknown as UserProfile[], []);
  
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const { toast } = useToast();

  // Fetch only dynamic data like requests
  const fetchRequests = async () => {
    try {
        const requestsData = await getBookRequests();
        setRequests(requestsData);
    } catch (error) {
        console.error("Failed to fetch requests:", error);
    }
  }

  useEffect(() => {
    if (!isLoading) {
      if (!user || isStudent) {
        router.push(isStudent ? '/dashboard' : '/login');
      } else {
        // Only fetch requests now
        fetchRequests();
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

  const handleArchiveRequest = async (id: string) => {
    // Optimistically update the UI
    const originalRequests = requests;
    setRequests(prev => prev.filter(r => r.id !== id));
    toast({ title: "Request Archived", description: "The book request has been moved to the archive." });

    try {
        await archiveBookRequest(id!);
    } catch (error) {
        // If the API call fails, revert the UI and show an error
        setRequests(originalRequests);
        console.error("Failed to archive request", error);
        toast({ title: "Error", description: "Could not archive the request. Please try again.", variant: "destructive" });
    }
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
        <AddBookDialog onBookAdded={() => { /* No-op as we use static data for now */ }}>
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
                  <div className="text-2xl font-bold">{books.length}</div>
                  <p className="text-xs text-muted-foreground">in the entire catalog</p>
              </CardContent>
          </Card>
           <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                   <p className="text-xs text-muted-foreground">{`${users.filter(u => u.role === 'student').length} students, ${users.filter(u => u.role !== 'student').length} staff`}</p>
              </CardContent>
          </Card>
           <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                    <FileQuestion className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{requests.length}</div>
                    <p className="text-xs text-muted-foreground">new book requests from students</p>
                </CardContent>
           </Card>
           <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Activity</CardTitle>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{chartData.reduce((acc, item) => acc + item.borrows, 0)}</div>
                  <p className="text-xs text-muted-foreground">Total borrows this year</p>
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
                           <EditBookDialog book={book} onBookEdited={() => {}}>
                            <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                          </EditBookDialog>
                          <DeleteBookDialog bookId={book.id} bookTitle={book.title} onBookDeleted={() => {}}>
                            <Button variant="destructive" size="sm">Delete</Button>
                          </DeleteBookDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
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
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email / Reg No.</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u: any) => (
                      <TableRow key={u.uid}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell>{u.role === 'student' ? u.regNumber : u.email}</TableCell>
                        <TableCell>
                          <Badge variant={u.role.includes('staff') || u.role.includes('admin') || u.role.includes('librarian') ? 'default' : 'outline'} className="capitalize">{u.role}</Badge>
                        </TableCell>
                        <TableCell>
                            {u.createdAt ? new Date(u.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <EditUserDialog user={u} onUserUpdated={() => {}}>
                            <Button variant="outline" size="sm" disabled={user?.uid === u.uid}>Edit</Button>
                          </EditUserDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
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
                            <Button variant="outline" size="sm" onClick={() => handleArchiveRequest(request.id!)}>
                                <Archive className="h-4 w-4" />
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
