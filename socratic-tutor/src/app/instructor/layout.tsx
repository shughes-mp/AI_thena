import { UserButton } from "@clerk/nextjs";

export default function InstructorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <div className="fixed right-5 top-5 z-50 rounded-full bg-white p-1 shadow-sm">
        <UserButton />
      </div>
      {children}
    </>
  );
}
