import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { nanoid } from "nanoid"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all members without codes
    const members = await prisma.eventMember.findMany({
      where: {
        memberCode: null,
      },
    })

    // Update each member with a unique code
    for (const member of members) {
      await prisma.eventMember.update({
        where: { id: member.id },
        data: { memberCode: `mem_${nanoid(10)}` },
      })
    }

    return NextResponse.json({ success: true, updatedCount: members.length })
  } catch (error) {
    console.error("Error updating member codes:", error)
    return NextResponse.json(
      { error: "Failed to update member codes" },
      { status: 500 }
    )
  }
}
