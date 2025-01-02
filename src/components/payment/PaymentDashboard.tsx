'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';

export default function PaymentDashboard() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleConnectStripe = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/payments/connect-stripe', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error connecting to Stripe:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Payment Settings</h2>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Stripe Integration</h3>
            <p className="text-sm text-gray-500">Accept payments via credit card</p>
          </div>
          <Button
            onClick={handleConnectStripe}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.stripe className="mr-2 h-4 w-4" />
            )}
            Connect Stripe
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">PayPal Integration</h3>
            <p className="text-sm text-gray-500">Accept PayPal payments</p>
          </div>
          <Button variant="outline">
            <Icons.paypal className="mr-2 h-4 w-4" />
            Connect PayPal
          </Button>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-2">Payment Methods</h3>
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Icons.creditCard className="h-6 w-6" />
                <div>
                  <p className="font-medium">Credit Card Payments</p>
                  <p className="text-sm text-gray-500">Visa, Mastercard, Amex</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">Configure</Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
} 
