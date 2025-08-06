"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSignUp, useSignIn } from "@clerk/nextjs";
import { OTPInput, SlotProps } from "input-otp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { OAuthStrategy } from "@clerk/types";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function RegisterPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { signIn } = useSignIn();

  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ message: string }[]>([]);
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const signInWith = (strategy: OAuthStrategy) => {
    return signUp?.authenticateWithRedirect({
      strategy,
      redirectUrl: "/register/sso-callback",
      redirectUrlComplete: "/",
    });
  };

  async function handleSignInWith(strategy: OAuthStrategy) {
    if (!signIn || !signUp) return null;

    const userExistsButNeedsToSignIn =
      signUp.verifications.externalAccount.status === "transferable" &&
      signUp.verifications.externalAccount.error?.code ===
        "external_account_exists";

    if (userExistsButNeedsToSignIn) {
      const res = await signIn.create({ transfer: true });

      if (res.status === "complete") {
        await setActive({
          session: res.createdSessionId,
        });
      }
    }

    const userNeedsToBeCreated =
      signIn.firstFactorVerification.status === "transferable";

    if (userNeedsToBeCreated) {
      const res = await signUp.create({
        transfer: true,
      });

      if (res.status === "complete") {
        await setActive({
          session: res.createdSessionId,
        });
      }
    } else {
      signInWith(strategy);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsLoading(true);

    if (!isLoaded) {
      setErrors([
        { message: "Authentication service not ready. Please try again." },
      ]);
      setIsLoading(false);
      return;
    }

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setErrors([{ message: "Passwords do not match" }]);
      setIsLoading(false);
      return;
    }

    try {
      const result = await signUp.create({
        emailAddress: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      if (result.status === "complete") {
        // If sign up is immediately complete (shouldn't happen with email verification)
        await setActive({ session: result.createdSessionId });
        router.push("/");
      } else {
        // Normal flow - prepare email verification
        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });
        setVerifying(true);
      }
    } catch (err: any) {
      const errorMessage =
        err.errors?.[0]?.message ||
        "An error occurred during registration. Please try again.";
      setErrors([{ message: errorMessage }]);
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsLoading(true);

    if (!isLoaded) {
      setErrors([
        { message: "Authentication service not ready. Please try again." },
      ]);
      setIsLoading(false);
      return;
    }

    if (code.length !== 6) {
      setErrors([{ message: "Please enter a valid 6-digit code" }]);
      setIsLoading(false);
      return;
    }

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.push("/");
      } else {
        setErrors([{ message: "Verification failed. Please try again." }]);
        console.error("Verification failed:", signUpAttempt);
      }
    } catch (err: any) {
      const errorMessage =
        err.errors?.[0]?.message ||
        "An error occurred during verification. Please try again.";
      setErrors([{ message: errorMessage }]);
      console.error(err);
      console.error("Verification error:", errorMessage ? errorMessage : err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToRegistration = () => {
    setVerifying(false);
    setErrors([]);
    setCode("");
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link href="/" className="flex justify-center">
            <span className="text-2xl font-bold text-blue-600">Spire</span>
          </Link>
          <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
            Verify your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We've sent a verification code to {formData.email}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-background py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {errors.length > 0 && (
              <div className="mb-4 bg-destructive/20 border-destructive/50 p-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <AlertDescription className="text-destructive">
                    {errors[0].message}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-foreground text-center"
                >
                  Enter verification code
                </label>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={code} onChange={setCode}>
                    <InputOTPGroup className="gap-2">
                      {Array(6)
                        .fill(0)
                        .map((_, index) => (
                          <InputOTPSlot
                            key={index}
                            index={index}
                            className={`w-12 h-12 text-2xl border rounded-md ${
                              errors.length > 0
                                ? "border-destructive"
                                : "border-input"
                            }`}
                          />
                        ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={code.length !== 6 || isLoading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors ${
                    code.length !== 6 || isLoading
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isLoading ? "Verifying..." : "Verify Email"}
                </button>
              </div>
              <div id="clerk-captcha"></div>
            </form>

            <div className="mt-6 text-center text-sm">
              <button
                type="button"
                onClick={handleBackToRegistration}
                disabled={isLoading}
                className={`font-medium text-primary hover:text-primary/80 transition-colors ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Back to registration
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex-col-reverse flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div id="clerk-captcha"></div>
      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link href="/" className="flex justify-center">
            <span className="text-2xl font-bold text-primary">Spire</span>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Or{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-border">
            {errors.length > 0 && (
              <div className="mb-4 bg-destructive/20 border-destructive/50 p-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <AlertDescription className="text-destructive">
                    {errors[0].message}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-foreground"
                  >
                    First name
                  </label>
                  <div className="mt-1">
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 bg-background border border-input rounded-md shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-foreground"
                  >
                    Last name
                  </label>
                  <div className="mt-1">
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 bg-background border border-input rounded-md shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground"
                >
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 bg-background border border-input rounded-md shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-foreground"
                >
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 bg-background border border-input rounded-md shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-foreground"
                >
                  Confirm password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 bg-background border border-input rounded-md shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors ${
                    isLoading ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? "Creating account..." : "Create account"}
                </button>
              </div>
              <div id="clerk-captcha"></div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
