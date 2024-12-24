import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const now = new Date();

    // Get upcoming events
    const upcomingEvents = await db.event.findMany({
      where: {
        date: {
          gte: now,
        },
      },
      orderBy: {
        date: "asc",
      },
      select: {
        id: true,
        title: true,
        description: true,
        date: true,
        location: true,
        imageUrl: true,
      },
    });

    // Get past events
    const pastEvents = await db.event.findMany({
      where: {
        date: {
          lt: now,
        },
      },
      orderBy: {
        date: "desc",
      },
      select: {
        id: true,
        title: true,
        description: true,
        date: true,
        location: true,
        imageUrl: true,
      },
    });

    return NextResponse.json({
      upcoming: upcomingEvents,
      past: pastEvents,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
