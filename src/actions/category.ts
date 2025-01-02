"use server"

import { prisma } from "@/lib/prisma"

export async function getCategories() {
  try {
    const categories = await prisma.eventCategory.findMany({
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
        icon: true,
      }
    })

    if(categories){
        return {
            category: categories,
            status: 200
        }
    }
    return { status: 400 }
  } catch (error) {
    console.error('Error fetching categories:', error)
    return {
        status: 400
    }
    // return NextResponse.json(
    //   { error: 'Failed to fetch categories' },
    //   { status: 500 }
    // )
  }
}