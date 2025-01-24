import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { eventFormSchema } from "@/lib/validations/event";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await db.event.delete({
      where: { id: params.eventId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[EVENTS_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const json = await request.json();
    const validatedData = eventFormSchema.parse(json);

    const event = await db.event.update({
      where: { id: params.eventId },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        location: validatedData.location,
        imageUrl: validatedData.imageUrl,
        signup_period_json: validatedData.signupPeriodJson,
        ...(validatedData.formSchemaId ? {
          formSchemaId: validatedData.formSchemaId
        } : {})
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

    return NextResponse.json(event);
  } catch (error) {
    console.error("[EVENT_PATCH]", error);
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}
