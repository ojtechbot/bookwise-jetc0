
'use client';

import { PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

const books = [
  { id: '1', title: 'The Midnight Library', author: 'Matt Haig', category: 'Fiction', downloads: 125 },
  { id: '2', title: 'Project Hail Mary', author: 'Andy Weir', category: 'Sci-Fi', downloads: 210 },
  { id: '3', title: 'Klara and the Sun', author: 'Kazuo Ishiguro', category: 'Fiction', downloads: 88 },
];

const users = [
  { id: '1', name: 'Admin User', email: 'admin@libroweb.io', role: 'Admin' },
  { id: '2', name: 'Librarian User', email: 'librarian@libroweb.io', role: 'Librarian' },
  { id: '3', name: 'Alex Johnson', email: '20240001@student.libroweb.io', role: 'Student' },
];

const chartData = [
    { month: 'January', borrows: 186, signups: 80 },
    { month: 'February', borrows: 305, signups: 200 },
    { month: 'March', borrows: 237, signups: 120 },
    { month: 'April', borrows: 273, signups: 190 },
    { month: 'May', borrows: 209, signups: 130 },
    { month: 'June', borrows: 214, signups: 140 },
];

const chartConfig = {
    borrows: {
        label: 'Borrows',
        color: 'hsl(var(--chart-1))',
    },
    signups: {
        label: 'Signups',
        color: 'hsl(var(--chart-2))',
    },
};


export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Simple check if user is staff/admin based on email domain
        if (user.email && !user.email.endsWith('@student.libroweb.io')) {
           setUser(user);
        } else {
           router.push('/dashboard'); // Redirect students
        }
      } else {
        router.push('/login');
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // Redirecting...
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold font-headline text-primary">Admin Dashboard</h1>
          <p className="text-lg text-muted-foreground">Manage your digital library resources.</p>
        </div>
        <Button className="mt-4 md:mt-0">
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Book
        </Button>
      </header>

       <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Library Activity Overview</CardTitle>
            <CardDescription>Monthly borrows and new user signups.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
              <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={chartData}>
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
                  </BarChart>
              </ResponsiveContainer>
             </ChartContainer>
          </CardContent>
        </Card>
      </section>

      <Tabs defaultValue="books">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="books">Book Management</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>
        <TabsContent value="books" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Books</CardTitle>
              <CardDescription>Upload, categorize, or delete ebooks from the library.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Downloads</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {books.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell className="font-medium">{book.title}</TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell><Badge variant="secondary">{book.category}</Badge></TableCell>
                      <TableCell>{book.downloads}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                        <Button variant="destructive" size="sm">Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                       <TableCell>
                        <Badge variant={user.role.includes('Admin') || user.role.includes('Librarian') ? 'default' : 'outline'}>{user.role}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                        <Button variant="destructive" size="sm">Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
