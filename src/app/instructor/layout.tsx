import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function InstructorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <>
      <div className="fixed right-5 top-5 z-50 rounded-full bg-white p-1 shadow-sm">
        <UserButton />
      </div>
      {children}
    </>
  );
}
