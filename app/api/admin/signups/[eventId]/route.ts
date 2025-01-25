import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ eventId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { eventId } = await context.params;

    const signups = await db.eventSignup.findMany({
      where: {
        eventId: eventId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(signups);
  } catch (error) {
    console.error("[EVENT_SIGNUPS]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ eventId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { eventId } = await context.params;

    await db.eventSignup.deleteMany({
      where: {
        eventId: eventId,
      },
    });

    return new NextResponse("Signups deleted successfully", { status: 200 });
  } catch (error) {
    console.error("[DELETE_EVENT_SIGNUPS]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
