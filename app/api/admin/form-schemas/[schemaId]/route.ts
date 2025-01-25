import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const formSchemaSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  fields: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      label: z.string(),
      name: z.string(),
      required: z.boolean(),
      placeholder: z.string().optional(),
      description: z.string().optional(),
      options: z
        .array(
          z.object({
            label: z.string(),
            value: z.string(),
          })
        )
        .optional(),
      validation: z
        .object({
          min: z.number().optional(),
          max: z.number().optional(),
          pattern: z.string().optional(),
          customMessage: z.string().optional(),
        })
        .optional(),
      order: z.number(),
    })
  ),
  terms: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      order: z.number(),
    })
  ),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ schemaId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { schemaId } = await context.params;
    const body = await request.json();

    const validatedData = formSchemaSchema.parse(body);

    // Delete existing fields and terms
    await db.formField.deleteMany({
      where: {
        schemaId: schemaId,
      },
    });

    await db.formSchema.update({
      where: {
        id: schemaId,
      },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        fields: {
          createMany: {
            data: validatedData.fields.map((field) => ({
              type: field.type,
              label: field.label,
              name: field.name,
              required: field.required,
              placeholder: field.placeholder,
              description: field.description,
              options: field.options || [],
              validation: field.validation || {},
              order: field.order,
              schemaId: schemaId,
            })),
          },
        },
        terms: {
          createMany: {
            data: validatedData.terms.map((term, index) => ({
              text: term.text,
              order: index,
              schemaId: schemaId,
            })),
          },
        },
      },
      include: {
        fields: true,
        terms: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[FORM_SCHEMA_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ schemaId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { schemaId } = await context.params;

    await db.formSchema.delete({
      where: {
        id: schemaId,
      },
    });

    return new NextResponse("Form schema deleted successfully", {
      status: 200,
    });
  } catch (error) {
    console.error("[FORM_SCHEMA_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
