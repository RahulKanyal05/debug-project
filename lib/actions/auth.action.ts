"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

// Session duration (1 week)
const SESSION_DURATION = 60 * 60 * 24 * 7;

// --- 1. SET SESSION COOKIE (Helper) ---
export async function setSessionCookie(idToken: string) {
  try {
    const cookieStore = await cookies();

    // Create session cookie from Firebase Admin
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION * 1000, // milliseconds
    });

    // Set cookie in the browser
    cookieStore.set("session", sessionCookie, {
      maxAge: SESSION_DURATION,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // True on Vercel
      path: "/",
      sameSite: "lax",
    });

    return { success: true };
  } catch (error) {
    console.error("Error setting session cookie:", error);
    return { success: false, message: "Failed to create session cookie" };
  }
}

// --- 2. SIGN UP ---
export async function signUp(params: any) {
  const { uid, name, email } = params;

  if (!uid || !name || !email) {
    return { success: false, message: "Missing required fields" };
  }

  try {
    const userRecord = await db.collection("users").doc(uid).get();
    if (userRecord.exists) {
      return { success: false, message: "User already exists. Please sign in." };
    }

    await db.collection("users").doc(uid).set({
      name,
      email,
      createdAt: new Date().toISOString(),
    });

    return { success: true, message: "Account created successfully." };
  } catch (error: any) {
    console.error("Error creating user:", error);
    return { success: false, message: error.message || "Failed to create account." };
  }
}

// --- 3. SIGN IN (THE FIXED FUNCTION) ---
export async function signIn(params: any) {
  const { email, idToken } = params;

  if (!email || !idToken) {
    return { success: false, message: "Missing email or token" };
  }

  try {
    // 1. Check if user exists in Firebase Auth
    // (Note: We use getUserByEmail to ensure the user is real)
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord) {
      return { success: false, message: "User not found. Please sign up." };
    }

    // 2. ATTEMPT TO SET COOKIE
    const cookieResult = await setSessionCookie(idToken);

    // 3. CRITICAL CHECK: Did the cookie actually set?
    if (!cookieResult.success) {
      return { success: false, message: "Session creation failed. Check server logs." };
    }

    // 4. Only return true if cookie was set
    return { success: true, message: "Signed in successfully" };

  } catch (error: any) {
    console.error("Sign in error:", error);
    return { success: false, message: "Authentication failed." };
  }
}

// --- 4. SIGN OUT ---
export async function signOutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  return { success: true };
}

// --- 5. GET CURRENT USER ---
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) return null;

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    if (!decodedClaims?.uid) return null;

    const userRecord = await db.collection("users").doc(decodedClaims.uid).get();
    return userRecord.exists ? { ...userRecord.data(), id: userRecord.id } : null;
  } catch (error) {
    // console.error("Session verification failed:", error); 
    // ^ Silence this error because it happens normally when session expires
    return null;
  }
}

// --- 6. CHECK AUTH STATUS (Missing Helper) ---
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user; // Returns true if user exists, false otherwise
}

