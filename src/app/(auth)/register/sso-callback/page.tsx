import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SSOCallback() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex items-center justify-center min-h-screen">
        <AuthenticateWithRedirectCallback
          afterSignInUrl="/"
          afterSignUpUrl="/"
          redirectUrl="/"
        />
      </div>
    </Suspense>
  );
}
