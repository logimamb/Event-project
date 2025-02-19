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
        city: true,
        country: true,
        Location: {
          select: {
            city: true,
            country: true
          }
        }
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
    console.log('Received data:', data)

    // Remove undefined values from update data
    const updateData: any = {
      name: data.name,
      email: data.email,
      notificationsEnabled: data.emailNotifications === 'true'
    }

    // Add city/country if location is provided
    if (data.location) {
      updateData.city = data.location
    }

    // Filter out undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key]
      }
    })

    console.log('Updating user with:', updateData)

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
        city: true,
        country: true,
        Location: {
          select: {
            city: true,
            country: true
          }
        }
      }
    })

    console.log('Updated user:', updatedUser)
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Profile Update Error:', error)
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 })
  }
}
