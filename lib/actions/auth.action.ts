"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 Days

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

async function setSessionCookie(idToken: string) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION * 1000,
    });

    cookieStore.set("session", sessionCookie, {
      maxAge: SESSION_DURATION,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return true;
  } catch (err) {
    console.error("Set session cookie error:", err);
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/* SIGN UP                                                                    */
/* -------------------------------------------------------------------------- */

export async function signUp(params: { uid: string; name: string; email: string }) {
  const { uid, name, email } = params;

  try {
    const doc = await db.collection("users").doc(uid).get();
    if (doc.exists) return { success: false, message: "User already exists" };

    await db.collection("users").doc(uid).set({
      name,
      email,
      createdAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (err: any) {
    console.error("Sign up error:", err);
    return { success: false, message: err.message || "Signup failed" };
  }
}

/* -------------------------------------------------------------------------- */
/* SIGN IN                                                                    */
/* -------------------------------------------------------------------------- */

export async function signIn(params: { email: string; idToken: string }) {
  const { email, idToken } = params;

  if (!email || !idToken) return { success: false, message: "Missing credentials" };

  try {
    // 1. Verify User in Auth
    const userRecord = await auth.getUserByEmail(email);

    // 2. Auto-Fix: Ensure DB Profile Exists
    const userDoc = await db.collection("users").doc(userRecord.uid).get();
    if (!userDoc.exists) {
      await db.collection("users").doc(userRecord.uid).set({
        name: userRecord.displayName || email.split("@")[0],
        email: userRecord.email,
        createdAt: new Date().toISOString(),
        photoURL: userRecord.photoURL || null,
      });
    }

    // 3. Set Cookie
    const ok = await setSessionCookie(idToken);
    if (!ok) return { success: false, message: "Session creation failed" };

  } catch (err: any) {
    console.error("Sign in error:", err);
    return { success: false, message: "Authentication failed" };
  }

  // 4. Force Server Redirect
  redirect("/");
}

/* -------------------------------------------------------------------------- */
/* GET CURRENT USER (Clean & Self-Healing)                                    */
/* -------------------------------------------------------------------------- */

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) return null;

  try {
    const decoded = await auth.verifySessionCookie(session, true);
    if (!decoded?.uid) return null;

    const userDoc = await db.collection("users").doc(decoded.uid).get();

    // Standard Case: User found
    if (userDoc.exists) {
      return { id: userDoc.id, ...userDoc.data() };
    }

    // Edge Case: Ghost User (Auto-Fix silently)
    const newUser = {
      name: decoded.name || decoded.email?.split("@")[0] || "User",
      email: decoded.email || "",
      createdAt: new Date().toISOString(),
      photoURL: decoded.picture || null,
    };
    await db.collection("users").doc(decoded.uid).set(newUser);

    return { id: decoded.uid, ...newUser };

  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* AUTH CHECK                                                                 */
/* -------------------------------------------------------------------------- */

export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}

export async function signOutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  return { success: true };
}