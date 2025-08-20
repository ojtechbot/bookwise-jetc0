
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { BookMarked, BrainCircuit, Users } from 'lucide-react';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto py-16 px-4 md:px-6">
        {/* Hero Section */}
        <section className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary">About Foundation Polytechnic</h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-foreground/80">
            A world-class polytechnic dedicated to developing the next generation of Hi-Tech industry leaders.
          </p>
          <div className="mt-8">
            <Image
              src="https://placehold.co/1200x500.png"
              alt="Foundation Polytechnic Campus"
              width={1200}
              height={500}
              className="rounded-lg shadow-lg mx-auto"
              data-ai-hint="modern university campus"
            />
          </div>
        </section>

        {/* About Section */}
        <section className="mt-24">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <h2 className="text-3xl font-bold font-headline text-primary">About Foundation Polytechnic, Ikot Ekpene</h2>
                    <p className="mt-4 text-lg text-foreground/90 leading-relaxed">
                        Foundation Polytechnic, Ikot Ekpene is a world-class polytechnic. The National Board for Technical Education (NBTE), Kaduna has granted accreditation for all the programmes presented for accreditation.
                    </p>
                     <p className="mt-4 text-lg text-foreground/90 leading-relaxed">
                        The programmes of the polytechnic are specifically designed to develop low and middle cadre manpower to meet the need of Hi-Tech Industries. These programmes are skill-based tailored to link theoretical knowledge with practical applications in industries. Our students on completion of the programme would be equipped with cutting-edge skills to establish their own businesses if desired.
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                     <Card className="bg-primary/10">
                        <CardContent className="p-6 flex items-center gap-4">
                            <BookMarked className="h-12 w-12 text-primary" />
                            <div>
                                <h3 className="text-xl font-bold">NBTE Accredited</h3>
                                <p className="text-muted-foreground mt-1">All presented programmes are fully accredited by the National Board for Technical Education.</p>
                            </div>
                        </CardContent>
                    </Card>
                     <Card className="bg-accent/10">
                        <CardContent className="p-6 flex items-center gap-4">
                            <BrainCircuit className="h-12 w-12 text-accent" />
                             <div>
                                <h3 className="text-xl font-bold">Skill-Based Programmes</h3>
                                <p className="text-muted-foreground mt-1">Our curriculum is designed to equip students with practical, cutting-edge skills for the Hi-Tech industry.</p>
                            </div>
                        </CardContent>
                    </Card>
                     <Card className="bg-secondary">
                        <CardContent className="p-6 flex items-center gap-4">
                            <Users className="h-12 w-12 text-secondary-foreground" />
                            <div>
                                <h3 className="text-xl font-bold">Empowering Entrepreneurs</h3>
                                <p className="text-muted-foreground mt-1">We empower students to establish their own businesses and become leaders in their fields.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
      </div>
    </div>
  );
}
