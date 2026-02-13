import { redirect } from 'next/navigation';

// Redirect /platform to / (canonical homepage URL)
export default function PlatformRedirect() {
  redirect('/');
}
