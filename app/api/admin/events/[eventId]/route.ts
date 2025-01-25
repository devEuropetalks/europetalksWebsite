import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { eventFormSchema } from "@/lib/validations/event";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

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

    // First delete all signups for this event
    await db.eventSignup.deleteMany({
      where: { eventId },
    });

    // Then delete the event itself
    await db.event.delete({
      where: { id: eventId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[EVENT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: { eventId: string } }
) {
  try {
    const { userId } = await auth();
    const { eventId } = await context.params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const validatedData = eventFormSchema.parse(json);

    console.log("Updating event with data:", {
      ...validatedData,
      startDate: new Date(validatedData.startDate),
      endDate: validatedData.endDate
        ? new Date(validatedData.endDate)
        : undefined,
    });

    const event = await db.event.update({
      where: { id: eventId },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        startDate: new Date(validatedData.startDate),
        endDate: validatedData.endDate
          ? new Date(validatedData.endDate)
          : undefined,
        location: validatedData.location,
        imageUrl: validatedData.imageUrl,
        signup_period_json: validatedData.signupPeriodJson,
        formSchemaId: validatedData.formSchemaId,
      },
      include: {
        formSchema: {
          include: {
            fields: true,
            terms: true,
          },
        },
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("[EVENT_PATCH]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
