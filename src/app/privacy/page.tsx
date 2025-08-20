
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary">Privacy Policy</CardTitle>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </CardHeader>
        <CardContent className="space-y-6 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold font-headline mb-2">Introduction</h2>
            <p>
              Welcome to the Foundation Polytechnic digital library. We are committed to protecting your privacy and handling your data in an open and transparent manner. This privacy policy sets out how we collect, use, and protect any information that you give us when you use this application.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-headline mb-2">Information We Collect</h2>
            <p>We may collect the following information:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>Account Information:</strong> When you register, we collect your name, email address, role (student/staff), and registration number (for students).</li>
              <li><strong>Authentication Credentials:</strong> We securely handle your password or PIN for login purposes. We do not store passwords in plain text.</li>
              <li><strong>Borrowing History:</strong> We maintain a record of the books you borrow and return, including dates.</li>
              <li><strong>Reviews and Ratings:</strong> Any reviews or ratings you submit for books are collected and linked to your profile.</li>
              <li><strong>AI Chat Interactions:</strong> Conversations with our AI assistant may be logged to improve our services. We recommend not sharing sensitive personal information in the chat.</li>
              <li><strong>User-Generated Content:</strong> This includes your profile picture, whether uploaded or generated via our AI service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-headline mb-2">How We Use Your Information</h2>
            <p>We use the information we collect for the following purposes:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>To provide and manage your account and our services.</li>
              <li>To personalize your experience, such as providing book recommendations.</li>
              <li>To process transactions, like borrowing and returning books.</li>
              <li>To improve our application and services, including our AI assistant.</li>
              <li>To communicate with you regarding your account or services.</li>
              <li>To maintain the security and integrity of our platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-headline mb-2">Data Security</h2>
            <p>
              We are committed to ensuring that your information is secure. We use industry-standard security measures, including Firebase Authentication and Firestore Security Rules, to prevent unauthorized access, use, or disclosure of your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-headline mb-2">Third-Party Services</h2>
            <p>
              We use Google's Gemini models through the Genkit framework to power our AI features. Your interactions with these features are subject to Google's Privacy Policy. We do not share your personal account information (like email or name) directly with the models, but the content of your prompts is processed by them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-headline mb-2">Your Rights</h2>
            <p>
              You have certain rights regarding your personal data. You can access and update your profile information through the settings page. You may also request the deletion of your account and associated data by contacting our support team. Please note that some anonymous data may be retained for analytical purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-headline mb-2">Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any significant changes by posting the new policy on this page. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
