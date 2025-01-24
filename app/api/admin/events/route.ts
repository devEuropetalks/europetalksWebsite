import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { eventFormSchema } from "@/lib/validations/event";
import { z } from "zod";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const events = await db.event.findMany({
      include: {
        formSchema: {
          include: {
            fields: true,
            terms: true
          }
        }
      },
      orderBy: {
        startDate: "desc",
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("[EVENTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const json = await request.json();
    const validatedData = eventFormSchema.parse(json);

    const event = await db.event.create({
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
    console.error("[EVENTS_POST]", error);
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}
