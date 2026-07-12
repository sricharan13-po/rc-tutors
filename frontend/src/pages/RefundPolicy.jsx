import LegalLayout, { Section } from '../components/LegalLayout'

export default function RefundPolicy() {
  return (
    <LegalLayout title="Refund & Cancellation Policy" lastUpdated="12 July 2026">
      <p>
        We want you to feel confident enrolling with RC Tutors. This policy explains when refunds
        are available and how to request one.
      </p>

      <Section heading="7-day satisfaction window">
        <p>
          If, within the <strong>first 7 days</strong> from the date of payment, the student is not
          happy with the classes, you may request a refund of <strong>60% of the fee paid</strong>.
          The remaining 40% covers the classes already attended and administrative costs.
        </p>
      </Section>

      <Section heading="After 7 days">
        <p>
          After the first 7 days from payment, the monthly fee is <strong>non-refundable</strong>.
          You are welcome to choose not to renew for the following month at any time.
        </p>
      </Section>

      <Section heading="How to request a refund">
        <p>To request a refund within the 7-day window, contact us with your account email:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Email: <a href="mailto:reachsricharanvasireddy@gmail.com" className="text-primary hover:underline">reachsricharanvasireddy@gmail.com</a></li>
          <li>WhatsApp: +91 72071 52080</li>
        </ul>
      </Section>

      <Section heading="How refunds are processed">
        <p>
          Approved refunds are returned to your original payment method through Razorpay. Please
          allow <strong>5–10 business days</strong> for the amount to appear, depending on your bank.
        </p>
      </Section>

      <Section heading="Cancelling future classes">
        <p>
          Tuition is billed one month at a time — there is no automatic long-term contract. To stop
          classes, simply let us know before the next month begins, and you will not be charged
          again.
        </p>
      </Section>

      <Section heading="Contact">
        <p>
          Questions about a refund? Email <a href="mailto:reachsricharanvasireddy@gmail.com" className="text-primary hover:underline">reachsricharanvasireddy@gmail.com</a> or
          message us on WhatsApp at +91 72071 52080.
        </p>
      </Section>
    </LegalLayout>
  )
}
