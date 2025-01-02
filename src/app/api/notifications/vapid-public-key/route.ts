import { NextResponse } from 'next/server'
import { getVapidPublicKey } from '@/lib/push-notifications'

export async function GET() {
  try {
    const publicKey = getVapidPublicKey()
    if (!publicKey) {
      return new NextResponse('VAPID public key not configured', { status: 500 })
    }

    return NextResponse.json({ publicKey })
  } catch (error) {
    console.error('Error getting VAPID public key:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
