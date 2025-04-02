import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/app/components/form-message";
import { SubmitButton } from "@/app/components/submit-button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import Link from "next/link";

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<Message>;
}) {
  const message = await searchParams;

  return (
    <form className="w-full max-w-md mx-auto flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            href="/sign-up"
            className="text-primary underline hover:opacity-80"
          >
            Sign up
          </Link>
        </p>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <Label htmlFor="email">Email</Label>
        <Input name="email" placeholder="you@example.com" required />

        <div className="flex justify-between items-center">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-xs text-muted-foreground underline"
          >
            Forgot Password?
          </Link>
        </div>

        <Input
          type="password"
          name="password"
          placeholder="Your password"
          required
        />
      </div>

      <SubmitButton pendingText="Signing in..." formAction={signInAction}>
        Sign in
      </SubmitButton>

      <FormMessage message={message} />
    </form>
  );
}
