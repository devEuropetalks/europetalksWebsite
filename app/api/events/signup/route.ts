import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { db } from "@/lib/db";
import { format } from "date-fns";

// Define the type for the signup period JSON structure
type SignupPeriodJson = {
  startDate: string | null;
  endDate: string | null;
};

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.EVENT_SIGNUP_EMAIL_SERVER_USER,
    pass: process.env.EVENT_SIGNUP_EMAIL_SERVER_PASSWORD,
  },
  secure: false,
  requireTLS: true,
  tls: {
    minVersion: "TLSv1.2",
    rejectUnauthorized: false,
  },
});

// Add verification
transporter.verify(function (error, success) {
  if (error) {
    console.log("Event signup server connection failed:", error);
  } else {
    console.log("Event signup server is ready to take messages", success);
  }
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventId, fullName, email, ...formData } = body;

    // Get event details and check registration period
    const event = await db.event.findUnique({
      where: { id: eventId },
      select: { 
        title: true,
        startDate: true,
        signup_period_json: true,
        formSchema: {
          include: {
            fields: true,
            terms: true
          }
        }
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Parse the signup period JSON
    const signupPeriod = event.signup_period_json as SignupPeriodJson;

    // Check if registration is still open
    const now = new Date();
    const signupStart = signupPeriod?.startDate
      ? new Date(signupPeriod.startDate)
      : new Date(0); // If not set, registration is open from the beginning
    const signupEnd = signupPeriod?.endDate
      ? new Date(signupPeriod.endDate)
      : new Date(event.startDate); // If not set, registration closes at event start

    if (now < signupStart || now > signupEnd) {
      return NextResponse.json(
        { error: "Registration period is closed" },
        { status: 403 }
      );
    }

    // Format any date fields in the form data
    const formattedFormData = Object.entries(formData).reduce(
      (acc, [key, value]) => {
        // If the value is a valid ISO date string, format it for display
        const date = new Date(String(value));
        if (
          !isNaN(date.getTime()) &&
          typeof value === "string" &&
          value.match(/^\d{4}-\d{2}-\d{2}/)
        ) {
          acc[key] = format(date, "PPP");
        } else {
          acc[key] = String(value);
        }
        return acc;
      },
      {} as Record<string, string>
    );

    // Save to database using the existing db connection
    await db.eventSignup.create({
      data: {
        eventId,
        fullName,
        email,
        formData: formattedFormData,
      },
    });

    // Send confirmation email to user
    await transporter.sendMail({
      from: `"EuropeTalks" <${process.env.EVENT_SIGNUP_EMAIL_FROM}>`,
      to: email,
      subject: "Event Registration Confirmation",
      html: `
        <h1>Thank you for registering!</h1>
        <p>Dear ${fullName},</p>
        <p>Your registration for our EuropeTalks event "${
          event.title
        }" has been received. We'll send you more details soon.</p>
        <h2>Your Registration Details:</h2>
        ${Object.entries(formattedFormData)
          .map(([key, value]) => {
            const field = event.formSchema?.fields.find(f => f.name === key);
            return `<p><strong>${field?.label || key}:</strong> ${value}</p>`;
          })
          .join("\n")}
      `,
    });

    // Send notification to admin
    await transporter.sendMail({
      from: `"EuropeTalks" <${process.env.EVENT_SIGNUP_EMAIL_FROM}>`,
      to: process.env.SEND_TO_EMAIL,
      subject: "New Event Registration",
      html: `
        <h1>New Registration</h1>
        <p>Event: ${event.title} (ID: ${eventId})</p>
        <p>Name: ${fullName}</p>
        <p>Email: ${email}</p>
        <h2>Form Data:</h2>
        ${Object.entries(formattedFormData)
          .map(([key, value]) => {
            const field = event.formSchema?.fields.find(f => f.name === key);
            return `<p><strong>${field?.label || key}:</strong> ${value}</p>`;
          })
          .join("\n")}
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing signup:", error);
    return NextResponse.json(
      { error: "Failed to process signup" },
      { status: 500 }
    );
  }
}
