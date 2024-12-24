"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Textarea } from "../ui/textarea";
import { useTranslation } from "react-i18next";

interface EventSignupFormProps {
  eventId: string;
  eventTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function EventSignupForm({
  eventId,
  eventTitle,
  isOpen,
  onClose,
}: EventSignupFormProps) {
  const { t } = useTranslation("events");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

  const signupSchema = z.object({
    fullName: z.string().min(3, t("events.signUp.fullName.error")),
    email: z.string().email(t("events.signUp.email.error")),
    phone: z.string().optional(),
    motivation: z
      .string()
      .optional()
      .superRefine((val, ctx) => {
        const isAdminOrMember =
          user?.organizationMemberships?.[0]?.role === "org:admin" ||
          user?.organizationMemberships?.[0]?.role === "org:member";

        if (!isAdminOrMember && (!val || val.length < 50)) {
          ctx.addIssue({
            code: z.ZodIssueCode.too_small,
            minimum: 50,
            type: "string",
            inclusive: true,
            message: t("events.signUp.motivation.error"),
          });
        }
      }),
  });

  type SignupFormData = z.infer<typeof signupSchema>;

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.primaryEmailAddress?.emailAddress || "",
      phone: user?.phoneNumbers?.[0]?.phoneNumber || "",
      motivation: "",
    },
  });

  const handleSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/events/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          ...data,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to sign up");
      }

      toast({
        title: "Success!",
        description: "You have successfully signed up for the event.",
      });

      form.reset();
      onClose();
    } catch (error) {
      console.error("Error signing up:", error);
      toast({
        title: "Error",
        description: "Failed to sign up. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const showMotivationField =
    !user?.organizationMemberships?.[0]?.role ||
    !["org:admin", "org:member"].includes(
      user?.organizationMemberships?.[0]?.role as string
    );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("events.signUp.title")} {eventTitle}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("events.signUp.fullName.label")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("events.signUp.email.label")}</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("events.signUp.phone.label")}</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder={t("events.signUp.phone.placeholder")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showMotivationField && (
              <FormField
                control={form.control}
                name="motivation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("events.signUp.motivation.label")}</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={4}
                        placeholder={t("events.signUp.motivation.placeholder")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting 
                ? t("events.signUp.submitting")
                : t("events.signUp.submit")
              }
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
