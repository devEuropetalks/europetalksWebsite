import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { eventFormSchema } from "@/lib/validations/event";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

export async function DELETE(
  request: NextRequest,
  context: { params: { eventId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete all signups for this event first
    await db.eventSignup.deleteMany({
      where: { eventId: context.params.eventId },
    });

    // Then delete the event
    await db.event.delete({
      where: { id: context.params.eventId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[EVENTS_DELETE]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: { eventId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const validatedData = eventFormSchema.parse(json);

    const event = await db.event.update({
      where: { id: context.params.eventId },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
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
