
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import Image from 'next/image';

export default function ContactPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto py-16 px-4 md:px-6">
        {/* Hero Section */}
        <section className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary">Contact Us</h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-foreground/80">
            We are here to help. Reach out to us through any of the channels below.
          </p>
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

        {/* Contact Details Section */}
        <section className="mt-24 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Get in Touch</CardTitle>
              <CardDescription>Find our location, mailing address, and contact details below.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full mt-1">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Our Location</h3>
                    <p className="text-muted-foreground">Ikot Idem, Ikot Ekpene, Akwa Ibom State</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full mt-1">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Postal Address</h3>
                    <p className="text-muted-foreground">P. O. Box 1166 Ikot Ekpene, Akwa Ibom State</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                 <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full mt-1">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Call Us</h3>
                    <p className="text-muted-foreground">
                        <a href="mailto:support@foundationpoly.edu.ng" className="hover:text-primary">E-mail: support@foundationpoly.edu.ng</a>
                    </p>
                    <p className="text-muted-foreground">
                        <a href="tel:+2348027424802" className="hover:text-primary">Mobile: +2348027424802</a>
                    </p>
                  </div>
                </div>
                 <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full mt-1">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Working Hours</h3>
                    <p className="text-muted-foreground">Mon-Fri : 8am to 4pm</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Google Map Section */}
        <section className="mt-24 max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Find Us On The Map</CardTitle>
                    <CardDescription>Get directions to our campus.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3971.603330689366!2d7.71400677587784!3d5.193295837267491!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1042b329079eb71d%3A0xf5266d76192953cf!2sFoundation%20Polytechnic%2C%20Ikot%20Ekpene!5e0!3m2!1sen!2sng!4v1680000000000"
                            width="100%"
                            height="450"
                            style={{ border: 0 }}
                            allowFullScreen={true}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Foundation Polytechnic Location"
                        ></iframe>
                    </div>
                </CardContent>
            </Card>
        </section>
      </div>
    </div>
  );
}
