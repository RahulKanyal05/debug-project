"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import FormField from "@/components/FormField";

import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
} from "@/lib/auth/auth.firebase";
import { getAuthErrorMessage } from "@/lib/auth/auth.errors";
import { signIn, signUp } from "@/lib/actions/auth.action";

/* -------------------------------------------------------------------------- */
/*                                SCHEMAS                                     */
/* -------------------------------------------------------------------------- */

const signInSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthFormValues = {
  name?: string;
  email: string;
  password: string;
};

type AuthFormProps = {
  type: "sign-in" | "sign-up";
};

/* -------------------------------------------------------------------------- */
/*                                COMPONENT                                   */
/* -------------------------------------------------------------------------- */

const AuthForm = ({ type }: AuthFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isSignIn = type === "sign-in";

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(isSignIn ? signInSchema : signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  /* ------------------------------------------------------------------------ */
  /*                               HANDLERS                                   */
  /* ------------------------------------------------------------------------ */

  const handleSubmit = async (values: AuthFormValues) => {
    if (loading) return;
    setLoading(true);

    try {
      if (isSignIn) {
        // ---------- EMAIL SIGN IN ----------
        const cred = await signInWithEmail(values.email, values.password);
        const idToken = await cred.user.getIdToken();

        const result = await signIn({
          email: values.email,
          idToken,
        });

        if (!result?.success) {
          throw new Error(result?.message || "Sign in failed");
        }

        toast.success("Signed in successfully");
        router.push("/");
        router.refresh(); // 🔥 REQUIRED for middleware sync
      } else {
        // ---------- EMAIL SIGN UP ----------
        const cred = await signUpWithEmail(values.email, values.password);

        const result = await signUp({
          uid: cred.user.uid,
          name: values.name!,
          email: values.email,
        });

        if (!result.success) {
          throw new Error(result.message);
        }

        toast.success("Account created. Please sign in.");
        router.push("/sign-in");
        router.refresh();
      }
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const cred = await signInWithGoogle();

      if (!cred.user.email) {
        throw new Error("Google account has no email");
      }

      const idToken = await cred.user.getIdToken();

      // Try backend sign-in
      const signInResult = await signIn({
        email: cred.user.email,
        idToken,
      });

      if (!signInResult?.success) {
        // User not in DB → create
        const displayName =
          cred.user.displayName || cred.user.email.split("@")[0];

        const signUpResult = await signUp({
          uid: cred.user.uid,
          name: displayName,
          email: cred.user.email,
        });

        if (!signUpResult?.success) {
          throw new Error(signUpResult?.message || "Google sign-in failed");
        }
      }
      toast.success("Signed in with Google");
      router.push("/");
      router.refresh(); // 🔥 REQUIRED
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
      console.error("Google auth error:", error);
    } finally {
      setLoading(false);
    }
    
  };

  /* ------------------------------------------------------------------------ */
  /*                                   UI                                     */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="card flex flex-col gap-6 py-14 px-10">
        <div className="flex justify-center gap-2">
          <Image src="/logo.svg" alt="logo" height={32} width={38} />
          <h2 className="text-primary-100">PrepWise</h2>
        </div>

        <h3 className="text-center">Practice job interviews with AI</h3>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 mt-4"
          >
            {!isSignIn && (
              <FormField
                control={form.control}
                name="name"
                label="Name"
                placeholder="Your name"
                type="text"
              />
            )}

            <FormField
              control={form.control}
              name="email"
              label="Email"
              placeholder="you@example.com"
              type="email"
            />

            <FormField
              control={form.control}
              name="password"
              label="Password"
              placeholder="••••••••"
              type="password"
            />

            <Button className="btn w-full" type="submit" disabled={loading}>
              {loading
                ? "Please wait..."
                : isSignIn
                ? "Sign In"
                : "Create Account"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              Continue with Google
            </Button>
          </form>
        </Form>

        <p className="text-center">
          {isSignIn ? "No account yet?" : "Already have an account?"}
          <Link
            href={isSignIn ? "/sign-up" : "/sign-in"}
            className="ml-1 font-bold text-user-primary"
          >
            {isSignIn ? "Sign Up" : "Sign In"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
