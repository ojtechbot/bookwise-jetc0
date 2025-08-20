
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsAndConditionsPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary">Terms and Conditions</CardTitle>
           <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </CardHeader>
        <CardContent className="space-y-6 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold font-headline mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing and using the Foundation Polytechnic digital library ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-headline mb-2">2. Account Responsibility</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account and password, including but not limited to the restriction of access to your computer and/or account. You agree to accept responsibility for any and all activities or actions that occur under your account and/or password.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-headline mb-2">3. Acceptable Use</h2>
            <p>
              You agree not to use the Service for any purpose that is unlawful or prohibited by these terms. You may not use the Service in any manner that could damage, disable, overburden, or impair the Service or interfere with any other party's use and enjoyment of the Service.
            </p>
             <ul className="list-disc list-inside mt-2 space-y-1">
              <li>You must not misuse our AI services by generating inappropriate, offensive, or harmful content.</li>
              <li>You must not attempt to reverse-engineer, decompile, or otherwise attempt to discover the source code of the application.</li>
              <li>You agree to respect the intellectual property rights of the book authors and publishers. The ebooks provided are for personal use only.</li>
            </ul>
          </section>
          
           <section>
            <h2 className="text-2xl font-bold font-headline mb-2">4. AI-Powered Features</h2>
            <p>
              Our Service includes features powered by generative artificial intelligence (AI). While we strive to ensure the AI provides helpful and accurate information, we cannot guarantee its responses will be free of errors or inaccuracies. The AI's suggestions, summaries, and other outputs are for informational purposes only and should not be considered professional advice. We are not liable for any decisions made based on information provided by the AI.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-headline mb-2">5. Intellectual Property</h2>
            <p>
              The Service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of Foundation Polytechnic and its licensors. The ebooks and their content are the property of their respective copyright holders.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-headline mb-2">6. Termination</h2>
            <p>
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-headline mb-2">7. Limitation of Liability</h2>
            <p>
              In no event shall Foundation Polytechnic, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold font-headline mb-2">8. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which the company is based, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-headline mb-2">9. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
