import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Update payment and registration status
        await prisma.payment.update({
          where: {
            providerPaymentId: paymentIntent.id,
          },
          data: {
            status: 'COMPLETED',
            registration: {
              update: {
                status: 'CONFIRMED',
              },
            },
          },
        });
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        
        await prisma.payment.update({
          where: {
            providerPaymentId: failedPayment.id,
          },
          data: {
            status: 'FAILED',
            registration: {
              update: {
                status: 'CANCELLED',
              },
            },
          },
        });
        break;

      case 'charge.refunded':
        const refundedCharge = event.data.object as Stripe.Charge;
        const refundedPaymentIntent = refundedCharge.payment_intent as string;
        
        await prisma.payment.update({
          where: {
            providerPaymentId: refundedPaymentIntent,
          },
          data: {
            status: 'REFUNDED',
            registration: {
              update: {
                status: 'CANCELLED',
              },
            },
          },
        });
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
} 