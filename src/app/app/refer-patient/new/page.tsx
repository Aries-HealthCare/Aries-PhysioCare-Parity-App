import { redirect } from 'next/navigation';

export default function ReferPatientNewPage() {
  redirect('/app/refer-patient?mode=form');
}
