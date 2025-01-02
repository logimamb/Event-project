import { Suspense } from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import PaymentDashboard from '@/components/payment/PaymentDashboard';
import PaymentHistory from '@/components/payment/PaymentHistory';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default async function PaymentPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Payment Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Suspense fallback={<LoadingSpinner />}>
          <PaymentDashboard />
        </Suspense>
        
        <Suspense fallback={<LoadingSpinner />}>
          <PaymentHistory />
        </Suspense>
      </div>
    </div>
  );
} 
