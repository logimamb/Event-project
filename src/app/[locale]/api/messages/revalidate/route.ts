import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Revalidate the messages cache
    revalidateTag('messages')
    
    return NextResponse.json({ revalidated: true, now: Date.now() })
  } catch (error) {
    console.error('Error revalidating messages:', error)
    return NextResponse.json(
      { 
        revalidated: false, 
        now: Date.now(), 
        error: error instanceof Error ? error.message : 'Failed to revalidate' 
      }, 
      { status: 500 }
    )
  }
}
