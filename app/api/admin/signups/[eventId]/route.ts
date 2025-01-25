import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: { eventId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const signups = await db.eventSignup.findMany({
      where: {
        eventId: context.params.eventId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(signups);
  } catch (error) {
    console.error("[EVENT_SIGNUPS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
