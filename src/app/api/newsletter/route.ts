import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as z from 'zod'

const subscriptionSchema = z.object({
  email: z.string().email(),
  categories: z.array(z.string()).optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, categories } = subscriptionSchema.parse(body)

    // Check if email already exists
    const existingSubscription = await prisma.newsletter.findUnique({
      where: { email },
    })

    if (existingSubscription) {
      // Update existing subscription
      const subscription = await prisma.newsletter.update({
        where: { email },
        data: {
          isSubscribed: true,
          categories: {
            deleteMany: {},
            create: categories?.map((categoryId) => ({
              category: {
                connect: { id: categoryId },
              },
            })),
          },
        },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
        },
      })

      return NextResponse.json(subscription)
    }

    // Create new subscription
    const subscription = await prisma.newsletter.create({
      data: {
        email,
        isSubscribed: true,
        categories: {
          create: categories?.map((categoryId) => ({
            category: {
              connect: { id: categoryId },
            },
          })),
        },
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    })

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Failed to subscribe to newsletter:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid subscription data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Update subscription status to unsubscribed
    const subscription = await prisma.newsletter.update({
      where: { email },
      data: {
        isSubscribed: false,
        categories: {
          deleteMany: {},
        },
      },
    })

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Failed to unsubscribe from newsletter:', error)
    return NextResponse.json(
      { error: 'Failed to unsubscribe from newsletter' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const subscription = await prisma.newsletter.findUnique({
      where: { email },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Failed to fetch newsletter subscription:', error)
    return NextResponse.json(
      { error: 'Failed to fetch newsletter subscription' },
      { status: 500 }
    )
  }
} 