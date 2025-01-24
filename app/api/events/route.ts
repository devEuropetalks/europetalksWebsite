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

    return NextResponse.json({
      upcoming: upcomingEvents,
      past: pastEvents,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
