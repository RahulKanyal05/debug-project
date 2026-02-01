import { AuthError } from "firebase/auth";

export function getAuthErrorMessage(error: unknown): string {
  // Firebase Auth error
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error
  ) {
    const authError = error as AuthError;

    switch (authError.code) {
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "Invalid email or password";
      case "auth/email-already-in-use":
        return "Email already in use";
      case "auth/weak-password":
        return "Password must be at least 6 characters";
      case "auth/popup-closed-by-user":
        return "Google sign-in was cancelled";
      case "auth/too-many-requests":
        return "Too many attempts. Try again later";
    }
  }

  // Generic fallback
  if (error instanceof Error) {
    return error.message || "Something went wrong";
  }

  return "Authentication failed. Please try again.";
}
