import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { eventFormSchema } from "@/lib/validations/event";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const events = await db.event.findMany({
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
    const body = await request.json();
    const validatedData = eventFormSchema.parse(body);

    const event = await db.event.create({
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
    console.error("[EVENTS_POST]", error);
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}
