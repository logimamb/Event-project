import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const url = new URL(req.url)
    const userId = url.searchParams.get('userId')

    if (!userId || userId !== session.user.id) {
      return new NextResponse('Invalid user ID', { status: 400 })
    }

    const responseHeaders = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    })

    const stream = new TransformStream()
    const writer = stream.writable.getWriter()
    const encoder = new TextEncoder()

    // Send initial heartbeat
    writer.write(encoder.encode('event: ping\ndata: connected\n\n'))

    // Set up interval for heartbeat
    const interval = setInterval(async () => {
      try {
        // Check for new messages
        const messages = await prisma.message.findMany({
          where: {
            OR: [
              { toUserId: userId },
              { fromUserId: userId }
            ],
            createdAt: {
              gte: new Date(Date.now() - 30000) // Last 30 seconds
            }
          },
          include: {
            fromUser: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            },
            toUser: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        })

        // Send any new messages
        for (const message of messages) {
          const data = `data: ${JSON.stringify(message)}\n\n`
          writer.write(encoder.encode(data))
        }

        // Send heartbeat
        writer.write(encoder.encode('event: ping\ndata: heartbeat\n\n'))
      } catch (error) {
        console.error('Error in SSE interval:', error)
      }
    }, 5000)

    // Clean up on close
    req.signal.addEventListener('abort', () => {
      clearInterval(interval)
      writer.close()
    })

    return new NextResponse(stream.readable, {
      headers: responseHeaders,
    })
  } catch (error) {
    console.error('Error in SSE route:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
