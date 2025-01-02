import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { content, rating } = await req.json()
    
    if (!content || !rating) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        content,
        rating,
        userId: session.user.id,
      },
    })

    return NextResponse.json(testimonial)
  } catch (error) {
    console.error('[TESTIMONIALS_POST]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: {
        isPublished: true,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(testimonials)
  } catch (error) {
    console.error('[TESTIMONIALS_GET]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
