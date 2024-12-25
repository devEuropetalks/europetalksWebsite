import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const now = new Date();

    // Get upcoming events (where end date is in the future)
    const upcomingEvents = await db.event.findMany({
      where: {
        endDate: {
          gte: now,
        },
      },
      orderBy: {
        startDate: "asc",
      },
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        endDate: true,
        location: true,
        imageUrl: true,
      },
    });

    // Get past events (where end date is in the past)
    const pastEvents = await db.event.findMany({
      where: {
        endDate: {
          lt: now,
        },
      },
      orderBy: {
        startDate: "desc",
      },
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        endDate: true,
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
