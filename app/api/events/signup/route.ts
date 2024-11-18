import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.EVENT_SIGNUP_EMAIL_SERVER_USER,
    pass: process.env.EVENT_SIGNUP_EMAIL_SERVER_PASSWORD,
  },
  secure: true,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventId, fullName, email, phone, motivation } = body;

    // Send confirmation email to user
    await transporter.sendMail({
      from: process.env.EVENT_SIGNUP_EMAIL_FROM,
      to: email,
      subject: "Event Registration Confirmation",
      html: `
        <h1>Thank you for registering!</h1>
        <p>Dear ${fullName},</p>
        <p>Your registration has been received. We'll send you more details soon.</p>
      `,
    });

    // Send notification to admin with motivation included
    await transporter.sendMail({
      from: process.env.EVENT_SIGNUP_EMAIL_FROM,
      to: process.env.SEND_TO_EMAIL,
      subject: "New Event Registration",
      html: `
        <h1>New Registration</h1>
        <p>Event ID: ${eventId}</p>
        <p>Name: ${fullName}</p>
        <p>Email: ${email}</p>
        <p>Phone: ${phone || "Not provided"}</p>
        ${motivation ? `<p>Motivation: ${motivation}</p>` : ""}
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
