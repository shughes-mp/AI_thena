import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="minerva-page flex min-h-screen items-center justify-center px-5 py-12">
      <SignIn />
    </main>
  );
}
