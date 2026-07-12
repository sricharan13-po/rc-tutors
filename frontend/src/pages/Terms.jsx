import LegalLayout, { Section } from '../components/LegalLayout'

export default function Terms() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="12 July 2026">
      <p>
        These Terms of Service ("Terms") govern your use of RC Tutors. By creating an account,
        enrolling, or making a payment, you agree to these Terms. Please read them carefully.
      </p>

      <Section heading="1. Our services">
        <p>
          RC Tutors provides online tutoring for students in grades 1–6 in Math, Science, Writing,
          Finance, and French. Classes are held live over Google Meet on a small-batch basis,
          Monday to Friday, according to the published schedule.
        </p>
      </Section>

      <Section heading="2. Accounts">
        <ul className="list-disc pl-5 space-y-1">
          <li>Accounts must be created by a parent or legal guardian (students are minors).</li>
          <li>You agree to provide accurate information and to keep your password confidential.</li>
          <li>You are responsible for activity that happens under your account.</li>
        </ul>
      </Section>

      <Section heading="3. Fees & payment">
        <ul className="list-disc pl-5 space-y-1">
          <li>Tuition is billed as a monthly fee, shown on the Pricing page at the time of enrolment.</li>
          <li>Payments are processed securely through Razorpay.</li>
          <li>Any discounts (such as the sibling discount) apply as described on the site.</li>
          <li>We may update our prices; changes will not affect a month you have already paid for.</li>
        </ul>
      </Section>

      <Section heading="4. Classes & conduct">
        <ul className="list-disc pl-5 space-y-1">
          <li>Class links are for enrolled students only. Please do not share them publicly.</li>
          <li>We ask students to attend on time and behave respectfully so everyone can learn.</li>
          <li>We may occasionally reschedule a class; we will give notice where possible.</li>
        </ul>
      </Section>

      <Section heading="5. Refunds & cancellation">
        <p>
          Refunds and cancellations are governed by our <a href="/refund" className="text-primary hover:underline">Refund &amp; Cancellation Policy</a>.
        </p>
      </Section>

      <Section heading="6. Limitation of liability">
        <p>
          We provide tutoring services with reasonable care and skill, but we do not guarantee any
          specific academic result. To the extent permitted by law, RC Tutors is not liable for
          indirect or incidental losses arising from use of the service.
        </p>
      </Section>

      <Section heading="7. Changes to these Terms">
        <p>
          We may update these Terms from time to time. The "last updated" date above shows when.
          Continued use of the service after changes means you accept the updated Terms.
        </p>
      </Section>

      <Section heading="8. Governing law">
        <p>These Terms are governed by the laws of India.</p>
      </Section>

      <Section heading="9. Contact">
        <p>
          Questions? Email <a href="mailto:reachsricharanvasireddy@gmail.com" className="text-primary hover:underline">reachsricharanvasireddy@gmail.com</a> or
          message us on WhatsApp at +91 72071 52080.
        </p>
      </Section>
    </LegalLayout>
  )
}
