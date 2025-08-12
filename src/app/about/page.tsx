
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookMarked, BrainCircuit, Users } from 'lucide-react';
import Image from 'next/image';

const teamMembers = [
    {
        name: 'Pomari Osain Justin',
        role: 'Founder & Lead Developer',
        avatar: 'https://placehold.co/100x100.png',
        hint: 'male developer portrait'
    },
    {
        name: 'Jane Doe',
        role: 'Lead Librarian',
        avatar: 'https://placehold.co/100x100.png',
        hint: 'female librarian portrait'
    },
    {
        name: 'John Smith',
        role: 'AI Specialist',
        avatar: 'https://placehold.co/100x100.png',
        hint: 'male AI researcher'
    },
]

export default function AboutPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto py-16 px-4 md:px-6">
        {/* Hero Section */}
        <section className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary">About Libroweb</h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-foreground/80">
            Redefining the digital library experience for the next generation of learners, thinkers, and innovators.
          </p>
          <div className="mt-8">
            <Image
              src="https://placehold.co/1200x500.png"
              alt="Modern library interior"
              width={1200}
              height={500}
              className="rounded-lg shadow-lg mx-auto"
              data-ai-hint="modern library"
            />
          </div>
        </section>

        {/* Mission Section */}
        <section className="mt-24">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <h2 className="text-3xl font-bold font-headline text-primary">Our Mission</h2>
                    <p className="mt-4 text-lg text-foreground/90 leading-relaxed">
                        Our mission is to democratize access to information and foster a love for learning by providing a seamless, intuitive, and powerful digital library platform. We believe that knowledge should be accessible to everyone, everywhere, without barriers. Libroweb is designed to be more than just a repository of books; it's an interactive ecosystem for discovery, research, and collaboration.
                    </p>
                     <p className="mt-4 text-lg text-foreground/90 leading-relaxed">
                        We are committed to leveraging cutting-edge technology, including artificial intelligence, to create a personalized and engaging experience for every user. From our AI Study Buddy to intelligent search suggestions, we are constantly innovating to make learning more efficient and enjoyable.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <Card className="bg-primary/10">
                        <CardContent className="p-6 flex flex-col items-center text-center">
                            <BookMarked className="h-12 w-12 text-primary mb-4" />
                            <h3 className="text-xl font-bold">Vast Collection</h3>
                            <p className="text-muted-foreground mt-2">Access thousands of ebooks across all genres and academic fields.</p>
                        </CardContent>
                    </Card>
                     <Card className="bg-accent/10">
                        <CardContent className="p-6 flex flex-col items-center text-center">
                            <BrainCircuit className="h-12 w-12 text-accent mb-4" />
                            <h3 className="text-xl font-bold">AI-Powered</h3>
                            <p className="text-muted-foreground mt-2">Enhance your study with our intelligent chatbot and recommendation engine.</p>
                        </CardContent>
                    </Card>
                     <Card className="bg-secondary">
                        <CardContent className="p-6 flex flex-col items-center text-center">
                            <Users className="h-12 w-12 text-secondary-foreground mb-4" />
                            <h3 className="text-xl font-bold">Community-Focused</h3>
                            <p className="text-muted-foreground mt-2">Built for students, staff, and administrators to collaborate and grow.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>

        {/* Team Section */}
        <section className="mt-24 text-center">
            <h2 className="text-3xl font-bold font-headline text-primary">Meet the Team</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80">
                The passionate individuals dedicated to building the future of digital libraries.
            </p>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {teamMembers.map((member) => (
                    <Card key={member.name} className="bg-card">
                        <CardContent className="p-6">
                            <Image
                                src={member.avatar}
                                alt={`Avatar of ${member.name}`}
                                width={100}
                                height={100}
                                className="rounded-full mx-auto"
                                data-ai-hint={member.hint}
                            />
                            <h3 className="mt-4 text-xl font-bold">{member.name}</h3>
                            <p className="text-primary font-semibold">{member.role}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
      </div>
    </div>
  );
}
