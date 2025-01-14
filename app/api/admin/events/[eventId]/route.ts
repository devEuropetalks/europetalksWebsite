import { db } from "@/lib/db";
import { NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{
    eventId: string;
  }>;
}

export async function DELETE(req: Request, { params }: RouteContext) {
  try {
    const { eventId } = await params;
    await db.event.delete({
      where: { id: eventId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const { eventId } = await params;
    const body = await req.json();

    const event = await db.event.update({
      where: { id: eventId },
      data: {
        title: body.title,
        description: body.description,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : new Date(body.startDate),
        location: body.location,
        imageUrl: body.imageUrl,
        formFields: body.formFields || { fields: [] },
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error updating event:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
