import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const formSchemaSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  fields: z.array(z.object({
    type: z.string(),
    label: z.string(),
    name: z.string(),
    required: z.boolean(),
    placeholder: z.string().optional(),
    description: z.string().optional(),
    options: z.array(z.object({
      label: z.string(),
      value: z.string()
    })).optional(),
    validation: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional(),
      customMessage: z.string().optional()
    }).optional(),
    order: z.number()
  })),
  terms: z.array(z.object({
    text: z.string(),
    order: z.number()
  }))
});

type RouteContext = {
  params: {
    schemaId: string;
  };
};

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const json = await request.json();
    const body = formSchemaSchema.parse(json);

    // Delete existing fields and terms
    await db.formField.deleteMany({
      where: { schemaId: context.params.schemaId }
    });
    await db.eventTerm.deleteMany({
      where: { schemaId: context.params.schemaId }
    });

    // Update schema with new fields and terms
    const schema = await db.formSchema.update({
      where: { id: context.params.schemaId },
      data: {
        name: body.name,
        description: body.description,
        fields: {
          create: body.fields.map(field => ({
            type: field.type,
            label: field.label,
            name: field.name,
            required: field.required,
            placeholder: field.placeholder,
            description: field.description,
            options: field.options || [],
            validation: field.validation || {},
            order: field.order
          }))
        },
        terms: {
          create: body.terms.map(term => ({
            text: term.text,
            order: term.order
          }))
        }
      },
      include: {
        fields: true,
        terms: true
      }
    });

    return NextResponse.json(schema);
  } catch (error) {
    console.error("[FORM_SCHEMA_PATCH]", error);
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await db.formSchema.delete({
      where: { id: context.params.schemaId }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[FORM_SCHEMA_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 