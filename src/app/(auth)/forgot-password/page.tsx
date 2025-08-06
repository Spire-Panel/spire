"use client";

import { useEffect, useState } from "react";
import { useAuth, useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [secondFactor, setSecondFactor] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { isLoaded, signIn: clerkSignIn, setActive } = useSignIn();
  const signIn = clerkSignIn!; // We know signIn will be available when needed

  useEffect(() => {
    if (isSignedIn) {
      router.push("/");
    }
  }, [isSignedIn, router]);

  if (!isLoaded) {
    return null;
  }

  // Send the password reset code to the user's email
  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !signIn) return;

    setIsLoading(true);
    setError("");

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setSuccessfulCreation(true);
    } catch (err: any) {
      console.error("Error:", err);
      setError(
        err.errors?.[0]?.longMessage || "An error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  // Reset the user's password
  async function reset(e: React.FormEvent) {
    e.preventDefault();
    if (!password || !code || !signIn) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });

      if (result?.status === "needs_second_factor") {
        setSecondFactor(true);
      } else if (result?.status === "complete" && setActive) {
        await setActive({ session: result.createdSessionId });
        router.push("/");
      }
    } catch (err: any) {
      console.error("Error:", err);
      setError(
        err.errors?.[0]?.longMessage || "An error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">
            Forgot Password?
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {!successfulCreation
              ? "Enter your email to receive a password reset code"
              : "Enter the code sent to your email and your new password"}
          </p>
        </div>

        <Card className="w-full bg-card border-border">
          <CardHeader>
            <CardTitle className="text-xl">
              {!successfulCreation ? "Reset Password" : "Create New Password"}
            </CardTitle>
            <CardDescription>
              {!successfulCreation
                ? "We'll send you a code to reset your password"
                : "Enter the code from your email and your new password"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={!successfulCreation ? create : reset}
              className="space-y-4"
            >
              {error && (
                <Alert
                  variant="destructive"
                  className="bg-destructive/20 border-destructive/50"
                >
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {!successfulCreation ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="pl-10 bg-background"
                        placeholder="email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send Reset Code"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Verification Code</Label>
                    <Input
                      id="code"
                      name="code"
                      type="text"
                      required
                      className="bg-background"
                      placeholder="Enter the 6-digit code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      className="bg-background"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={isLoading}
                  >
                    {isLoading ? "Resetting..." : "Reset Password"}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              variant="link"
              asChild
              className="text-sm text-foreground hover:text-primary"
            >
              <Link href="/login" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to sign in
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {secondFactor && (
          <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-md text-sm text-yellow-500">
            <p>
              2FA is required. Please complete the second factor authentication.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
