import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ContentWrapper from "@/components/ContentWrapper";
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }
  console.log(user?.publicMetadata?.role);
  return (
    <ContentWrapper>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>
      {children}
    </ContentWrapper>
  );
}
