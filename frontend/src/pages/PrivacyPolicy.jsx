import LegalLayout, { Section } from '../components/LegalLayout'

export default function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="12 July 2026">
      <p>
        RC Tutors ("we", "us", "our") respects your privacy. This policy explains what
        information we collect, how we use it, and your choices. By using our website and
        services, you agree to this policy.
      </p>

      <Section heading="Information we collect">
        <p>We collect only what we need to provide tutoring:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Account details:</strong> parent/guardian name, email, and password (stored securely, never in plain text).</li>
          <li><strong>Student details:</strong> the child's grade and the subject of interest.</li>
          <li><strong>Enquiry details:</strong> any name, email, phone number, or message you send us through the contact form.</li>
          <li><strong>Payment details:</strong> processed securely by our payment provider (Razorpay). We never see or store your card, UPI, or bank details.</li>
        </ul>
      </Section>

      <Section heading="How we use your information">
        <ul className="list-disc pl-5 space-y-1">
          <li>To create and manage your account.</li>
          <li>To provide classes and send you the class joining link.</li>
          <li>To process payments and confirm enrolments.</li>
          <li>To respond to your enquiries and communicate about classes.</li>
        </ul>
      </Section>

      <Section heading="How we share information">
        <p>
          We do <strong>not</strong> sell your personal information. We only share it with trusted
          service providers who help us run the service:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Razorpay</strong> — to process payments.</li>
          <li><strong>Google Meet</strong> — to host live video classes.</li>
          <li>Our hosting and database providers — to store your account and enrolment data securely.</li>
        </ul>
      </Section>

      <Section heading="Children's privacy">
        <p>
          Our students are children in grades 1–6. Accounts must be created and managed by a
          parent or legal guardian. We collect only the minimum information needed to deliver
          classes and do not knowingly collect unnecessary personal data from children.
        </p>
      </Section>

      <Section heading="Data security & retention">
        <p>
          Passwords are stored using strong one-way encryption (hashing). We keep your data only
          for as long as your account is active or as needed to provide the service. You can ask
          us to delete your data at any time.
        </p>
      </Section>

      <Section heading="Cookies & local storage">
        <p>
          We use your browser's local storage to keep you signed in. We do not use third-party
          advertising or tracking cookies.
        </p>
      </Section>

      <Section heading="Your rights">
        <p>
          You may request access to, correction of, or deletion of your personal data by emailing
          us. We will respond within a reasonable time.
        </p>
      </Section>

      <Section heading="Contact us">
        <p>
          Questions about this policy? Email <a href="mailto:reachsricharanvasireddy@gmail.com" className="text-primary hover:underline">reachsricharanvasireddy@gmail.com</a> or
          message us on WhatsApp at +91 72071 52080.
        </p>
      </Section>
    </LegalLayout>
  )
}
