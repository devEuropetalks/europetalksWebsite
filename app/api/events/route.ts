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
      include: {
        formSchema: {
          include: {
            fields: true,
            terms: true
          }
        }
      }
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
      include: {
        formSchema: {
          include: {
            fields: true,
            terms: true
          }
        }
      }
    });

    // Return with caching headers
    return NextResponse.json(
      { upcoming: upcomingEvents, past: pastEvents },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
