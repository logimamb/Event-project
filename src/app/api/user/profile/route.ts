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
        location: {
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
    const {
      name,
      email,
      bio,
      title,
      company,
      website,
      phone,
      country,
      city,
      state,
      address,
      zipCode,
      timezone,
      language,
      linkedin,
      twitter,
      github,
      facebook,
      emailNotifications,
      pushNotifications,
      visibility,
    } = data

    console.log(data);
    

    // Create or update location
    let location = null
    if (country || city || state || address || zipCode) {
      location = await prisma.location.upsert({
        where: {
          id: session.user.id,
        },
        create: {
          country: country || '',
          city,
          state,
          address,
          zipCode,
          name
        },
        update: {
          country: country || '',
          city,
          state,
          address,
          zipCode,
        },
      })
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name,
        email,
        bio,
        // title,
        company,
        website,
        phoneNumber: phone,
        locationId: location?.id,
        timezone,
        // // language,
        // linkedin,
        // twitter,
        // github,
        // facebook,
        emailNotifications: emailNotifications === 'true',
        pushNotifications: pushNotifications === 'true',
        visibility,
      },
      // include: {
      //   location: true,
      // },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Profile Update Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 