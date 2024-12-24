import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.CONTACT_FORM_EMAIL_SERVER_USER,
    pass: process.env.CONTACT_FORM_EMAIL_SERVER_PASSWORD,
  },
  secure: false,
  requireTLS: true,
  tls: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: false
  }
});

// Verify connection configuration
transporter.verify(function(error, success) {
  if (error) {
    console.log('Server connection failed:', error);
  } else {
    console.log('Server is ready to take our messages', success);
  }
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = contactSchema.parse(body);
    const { name, email, subject, message } = validatedData;

    // Verify required environment variables
    if (!process.env.CONTACT_FORM_EMAIL_FROM || !process.env.SEND_TO_EMAIL) {
      console.error("Missing required environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Send email to admin
    await transporter.sendMail({
      from: `"Contact Form" <${process.env.CONTACT_FORM_EMAIL_FROM}>`,
      to: process.env.SEND_TO_EMAIL,
      subject: `Contact Form: ${subject}`,
      html: `
        <h1>New Contact Form Submission</h1>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    // Send confirmation email to user
    await transporter.sendMail({
      from: `"Your Organization Name" <${process.env.CONTACT_FORM_EMAIL_FROM}>`,
      to: email,
      subject: "We've received your message",
      html: `
        <h1>Thank you for contacting us!</h1>
        <p>Dear ${name},</p>
        <p>We've received your message and will get back to you as soon as possible.</p>
        <p>Your message details:</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending contact form:", error);
    // Log the full error stack trace
    if (error instanceof Error) {
      console.error(error.stack);
    }
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid form data", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { error: "Email server connection failed" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to send message", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
