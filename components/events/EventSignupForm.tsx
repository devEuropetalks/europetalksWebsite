"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormField as CustomFormField,
  createDynamicSchema,
  EventTerms,
} from "@/lib/types/event-form";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

interface EventSignupFormProps {
  eventId: string;
  eventTitle: string;
  formFields: CustomFormField[];
  terms: EventTerms[];
  isOpen: boolean;
  onClose: () => void;
}

export default function EventSignupForm({
  eventId,
  eventTitle,
  formFields,
  terms,
  isOpen,
  onClose,
}: EventSignupFormProps) {
  const { t } = useTranslation("events");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

  const signupSchema = createDynamicSchema(formFields, terms);
  type SignupFormData = z.infer<typeof signupSchema>;

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.primaryEmailAddress?.emailAddress || "",
      termsAgreement: [],
      ...Object.fromEntries(
        formFields.map((field) => [
          field.name,
          field.type === "checkbox" ? [] : field.type === "date" ? null : "",
        ])
      ),
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

  const renderFormField = (field: CustomFormField) => {
    const commonProps = {
      control: form.control,
      name: field.name,
    };

    const renderField = ({
      field: formField,
    }: {
      field: ControllerRenderProps;
    }) => (
      <FormItem>
        <FormLabel>{field.label}</FormLabel>
        <FormControl>
          {(() => {
            switch (field.type) {
              case "date":
                return (
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !formField.value && "text-muted-foreground"
                          )}
                        >
                          {formField.value ? (
                            format(new Date(formField.value), "PPP")
                          ) : (
                            <span>{field.placeholder || "Pick a date"}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          formField.value
                            ? new Date(formField.value)
                            : undefined
                        }
                        onSelect={(date) =>
                          formField.onChange(date ? date.toISOString() : null)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                );
              case "textarea":
                return (
                  <Textarea
                    {...formField}
                    placeholder={field.placeholder}
                    rows={4}
                  />
                );
              case "select":
                return (
                  <Select
                    value={formField.value}
                    onValueChange={formField.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={field.placeholder} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {field.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              case "checkbox":
                return (
                  <div className="space-y-2">
                    {field.options?.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`${field.name}-${option.value}`}
                          checked={formField.value?.includes(option.value)}
                          onCheckedChange={(checked) => {
                            const currentValue = formField.value || [];
                            const newValue = checked
                              ? [...currentValue, option.value]
                              : currentValue.filter(
                                  (v: string) => v !== option.value
                                );
                            formField.onChange(newValue);
                          }}
                        />
                        <label
                          htmlFor={`${field.name}-${option.value}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                );
              case "radio":
                return (
                  <RadioGroup
                    value={formField.value}
                    onValueChange={formField.onChange}
                    className="space-y-2"
                  >
                    {field.options?.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem
                          value={option.value}
                          id={`${field.name}-${option.value}`}
                        />
                        <label
                          htmlFor={`${field.name}-${option.value}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                );
              default:
                return (
                  <Input
                    {...formField}
                    type={field.type}
                    placeholder={field.placeholder}
                  />
                );
            }
          })()}
        </FormControl>
        {field.description && (
          <FormDescription>{field.description}</FormDescription>
        )}
        <FormMessage />
      </FormItem>
    );

    return <FormField key={field.id} {...commonProps} render={renderField} />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent aria-describedby="event-signup-description">
        <DialogHeader>
          <DialogTitle>
            {t("signUp.title")} {eventTitle}
          </DialogTitle>
          <DialogDescription id="event-signup-description">
            Complete this form to register for {eventTitle}. Please provide your
            personal information and any required event-specific details.
          </DialogDescription>
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
                  <FormLabel>{t("signUp.fullName.label")}</FormLabel>
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
                  <FormLabel>{t("signUp.email.label")}</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {formFields.map(renderFormField)}

            <div className="space-y-4 border-t pt-4 mt-4">
              <h3 className="font-medium text-lg">Terms and Conditions</h3>
              <div className="space-y-4">
                {terms.map((term) => (
                  <FormField
                    key={term.id}
                    control={form.control}
                    name="termsAgreement"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(term.id)}
                            onCheckedChange={(checked) => {
                              const value = field.value || [];
                              const newValue = checked
                                ? [...value, term.id]
                                : value.filter((id) => id !== term.id);
                              field.onChange(newValue);
                            }}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal">
                            {term.text}
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? t("signUp.submitting") : t("signUp.submit")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
