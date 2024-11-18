import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.CONTACT_FORM_EMAIL_SERVER_USER,
    pass: process.env.CONTACT_FORM_EMAIL_SERVER_PASSWORD,
  },
  secure: true,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Send email to admin
    await transporter.sendMail({
      from: process.env.CONTACT_FORM_EMAIL_FROM,
      to: process.env.SEND_TO_EMAIL,
      subject: `Contact Form: ${subject}`,
      html: `
        <h1>New Contact Form Submission</h1>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    // Send confirmation email to user
    await transporter.sendMail({
      from: process.env.CONTACT_FORM_EMAIL_FROM,
      to: email,
      subject: "We've received your message",
      html: `
        <h1>Thank you for contacting us!</h1>
        <p>Dear ${name},</p>
        <p>We've received your message and will get back to you as soon as possible.</p>
        <p>Your message details:</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending contact form:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
