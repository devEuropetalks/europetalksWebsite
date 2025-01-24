import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const eventSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    startDate: z.string(),
    endDate: z.string().optional(),
    location: z.string().min(1),
    imageUrl: z.string().url().optional(),
    formFields: z
      .object({
        fields: z.array(z.any()),
        terms: z.array(z.any()),
      })
      .optional()
      .default({ fields: [], terms: [] }),
    signupPeriodJson: z
      .object({
        startDate: z.string().nullable(),
        endDate: z.string().nullable(),
      })
      .optional()
      .default({ startDate: null, endDate: null }),
  })
  .transform((data) => ({
    ...data,
    endDate: data.endDate || data.startDate,
  }));

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
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        endDate: true,
        location: true,
        imageUrl: true,
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = eventSchema.parse(body);

    // Create event with all fields including signup period
    const event = await db.event.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        location: validatedData.location,
        imageUrl: validatedData.imageUrl,
        formFields: validatedData.formFields,
        signup_period_json: validatedData.signupPeriodJson
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 });
    }
    return new NextResponse("Failed to create event", { status: 500 });
  }
}
