import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: { eventId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch event details with form schema
    const event = await db.event.findUnique({
      where: { id: context.params.eventId },
      include: {
        formSchema: {
          include: {
            fields: true,
            terms: true,
          },
        },
      },
    });

    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }

    // Fetch all signups for the event
    const signups = await db.eventSignup.findMany({
      where: {
        eventId: context.params.eventId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Prepare CSV headers
    const headers = [
      "Name",
      "Email",
      "Signup Date",
      ...(event.formSchema?.fields.map((f) => f.label) || []),
      ...(event.formSchema?.terms.map((t) => `Term: ${t.text}`) || []),
    ];

    // Prepare CSV rows
    const rows = signups.map((signup) => {
      const basicInfo = [
        signup.fullName,
        signup.email,
        new Date(signup.createdAt).toLocaleString(),
      ];

      const formFields =
        event.formSchema?.fields.map(
          (field) => signup.formData[field.name] || ""
        ) || [];

      const terms = event.formSchema?.terms.map(() => "Accepted") || [];

      return [...basicInfo, ...formFields, ...terms];
    });

    // Convert to CSV string
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${event.title
          .toLowerCase()
          .replace(/\s+/g, "-")}-signups.csv"`,
      },
    });
  } catch (error) {
    console.error("[EVENT_SIGNUPS_EXPORT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
