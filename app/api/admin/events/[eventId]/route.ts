import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { eventFormSchema } from "@/lib/validations/event";
import { auth } from "@clerk/nextjs/server";

interface RouteContext {
  params: Promise<{
    eventId: string;
  }>;
}

export async function DELETE(req: Request, { params }: RouteContext) {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { eventId } = await params;
    await db.event.delete({
      where: { id: eventId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[EVENTS_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: RouteContext) {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { eventId } = await params;
    const body = await req.json();
    
    const validatedData = eventFormSchema.parse(body);

    const event = await db.event.update({
      where: { id: eventId },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        startDate: new Date(validatedData.startDate),
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        location: validatedData.location,
        imageUrl: validatedData.imageUrl,
        formFields: validatedData.formFields,
        signup_period_json: validatedData.signupPeriodJson,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("[EVENTS_PATCH]", error);
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}
