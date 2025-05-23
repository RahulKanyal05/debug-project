"use client"; // Add this directive to make this a client-side component

import { ReactNode, useEffect } from "react"; 
import { useRouter } from "next/navigation"; // For redirecting after sign-out
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/client"; // Firebase auth instance

const AuthLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter(); // Using Next.js router for redirection

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Redirecting the authenticated user to homepage
        router.replace("/"); // Redirect to home if the user is logged in
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, [router]); // Adding router as a dependency

  return <div className="auth-layout">{children}</div>;
};

export default AuthLayout;
