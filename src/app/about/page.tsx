
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { BookMarked, BrainCircuit, Users, Target, Eye, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
            <Button asChild size="lg" className="mt-8">
              <Link href="https://www.efacility.foundationpoly.edu.ng/Student/" target="_blank" rel="noopener noreferrer">
                Go to Student Portal <ExternalLink className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          <div className="mt-8 bg-primary/10 py-8 rounded-lg">
            <Image
              src="/images/logo.png"
              alt="Foundation Polytechnic Logo"
              width={800}
              height={200}
              className="rounded-lg mx-auto w-4/5 md:w-1/2"
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

         {/* Mission & Vision Section */}
        <section className="mt-24">
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="inline-block bg-primary/10 p-4 rounded-full">
                  <Target className="h-12 w-12 text-primary" />
                </div>
                <h3 className="mt-4 text-2xl font-bold font-headline">Mission</h3>
                <p className="mt-2 text-lg text-foreground/80">
                  To prepare learners who are innovation receptive, highly adaptable and problem solving minded people with pre-disposition to life-long learning, leadership and careers in an ever-changing world.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-8 text-center">
                 <div className="inline-block bg-accent/10 p-4 rounded-full">
                  <Eye className="h-12 w-12 text-accent" />
                </div>
                <h3 className="mt-4 text-2xl font-bold font-headline">Our Vision</h3>
                <p className="mt-2 text-lg text-foreground/80">
                  To be a pioneer tertiary institution of global distinction.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
