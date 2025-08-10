import { Book, Clock, HelpCircle, History, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

const borrowedBooks = [
  { id: '1', title: 'The Midnight Library', author: 'Matt Haig', dueDate: '2024-08-15' },
  { id: '2', title: 'Project Hail Mary', author: 'Andy Weir', dueDate: '2024-08-22' },
];

const historyBooks = [
  { id: '3', title: 'Klara and the Sun', author: 'Kazuo Ishiguro', returnDate: '2024-07-20' },
  { id: '4', title: 'The Vanishing Half', author: 'Brit Bennett', returnDate: '2024-07-11' },
];

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold font-headline text-primary">Student Dashboard</h1>
          <p className="text-lg text-muted-foreground">Welcome back, Alex.</p>
        </div>
        <Button asChild variant="outline" className="mt-4 md:mt-0">
          <Link href="/dashboard/settings">
            <Settings className="mr-2 h-4 w-4" />
            Profile Settings
          </Link>
        </Button>
      </header>
      <Tabs defaultValue="borrowed" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="borrowed"><Book className="mr-2 h-4 w-4" />Borrowed Books</TabsTrigger>
          <TabsTrigger value="history"><History className="mr-2 h-4 w-4" />History</TabsTrigger>
          <TabsTrigger value="requests"><HelpCircle className="mr-2 h-4 w-4" />Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="borrowed" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Currently Borrowed</CardTitle>
              <CardDescription>These are the books you have checked out. Please return them by the due date.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {borrowedBooks.map(book => (
                    <TableRow key={book.id}>
                      <TableCell className="font-medium">{book.title}</TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>{book.dueDate}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="mr-2">Read Online</Button>
                        <Button variant="outline" size="sm">Renew</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Return Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyBooks.map(book => (
                    <TableRow key={book.id}>
                      <TableCell className="font-medium">{book.title}</TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>{book.returnDate}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">Borrow Again</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="requests" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Request a New Book</CardTitle>
              <CardDescription>Can't find a book you're looking for? Request it here!</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">This feature is coming soon.</p>
              <Button disabled>Request Book</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
