import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') || ''
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const events = await prisma.event.findMany({
      where: {
        AND: [
          {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { location: { contains: query, mode: 'insensitive' } },
            ],
          },
          startDate ? { startDate: { gte: new Date(startDate) } } : {},
          endDate ? { endDate: { lte: new Date(endDate) } } : {},
        ],
      },
      include: {
        _count: {
          select: { activities: true },
        },
      },
      orderBy: { startDate: 'desc' },
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to search events' },
      { status: 500 }
    )
  }
} 