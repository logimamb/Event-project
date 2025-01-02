import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { subscription } = await request.json()
    if (!subscription?.endpoint) {
      return new NextResponse('Invalid subscription', { status: 400 })
    }

    // Save or update subscription
    await prisma.pushSubscription.upsert({
      where: {
        userId_endpoint: {
          userId: session.user.id,
          endpoint: subscription.endpoint,
        },
      },
      create: {
        userId: session.user.id,
        endpoint: subscription.endpoint,
        subscription: JSON.stringify(subscription),
      },
      update: {
        subscription: JSON.stringify(subscription),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving push subscription:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { subscription } = await request.json()
    if (!subscription?.endpoint) {
      return new NextResponse('Invalid subscription', { status: 400 })
    }

    await prisma.pushSubscription.deleteMany({
      where: {
        userId: session.user.id,
        endpoint: subscription.endpoint,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing push subscription:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { oldEndpoint, newSubscription } = await request.json()
    if (!oldEndpoint || !newSubscription?.endpoint) {
      return new NextResponse('Invalid subscription data', { status: 400 })
    }

    // Update subscription
    await prisma.pushSubscription.updateMany({
      where: {
        userId: session.user.id,
        endpoint: oldEndpoint,
      },
      data: {
        endpoint: newSubscription.endpoint,
        subscription: JSON.stringify(newSubscription),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating push subscription:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
