import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const events = await db.event.findMany({
      include: {
        _count: {
          select: { signups: true },
        },
      },
      orderBy: {
        startDate: "desc",
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("[EVENTS_WITH_SIGNUPS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
