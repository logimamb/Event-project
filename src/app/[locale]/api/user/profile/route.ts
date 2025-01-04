import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if(!session?.user){
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const data = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        name: true,
        email: true,
        image: true,
        locationId: true,
        city: true,
        country: true,
        phoneNumber: true,
        timezone: true,
        visibility: true,
        notificationsEnabled: true
      }
    })
    return NextResponse.json(data)
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const data = await request.json()

    // Only include fields that exist in the Prisma schema
    const updateData = {
      name: data.name,
      email: data.email,
      city: data.city,
      country: data.country,
      phoneNumber: data.phoneNumber,
      timezone: data.timezone,
      visibility: data.visibility,
      notificationsEnabled: data.emailNotifications
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key]
      }
    })

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: updateData,
      select: {
        name: true,
        email: true,
        image: true,
        locationId: true,
        city: true,
        country: true,
        phoneNumber: true,
        timezone: true,
        visibility: true,
        notificationsEnabled: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Profile Update Error:', error)
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 })
  }
}
