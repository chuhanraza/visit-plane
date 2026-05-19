import { redirect } from 'next/navigation'

// Redirect /visa-requirements → homepage (visa checker is on the homepage)
export default function VisaRequirementsPage() {
  redirect('/')
}
