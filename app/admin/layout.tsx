import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ContentWrapper from "@/components/ContentWrapper";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }
  // User role check passed
  return (
    <ContentWrapper>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mt-8">Admin Dashboard</h1>
      </div>
      {children}
    </ContentWrapper>
  );
}
