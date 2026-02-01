// lib/auth/auth.firebase.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseAuthSignOut,
} from "firebase/auth";
import type { UserCredential } from "firebase/auth";
import { auth } from "@/firebase/client";

/* -------------------------------------------------------------------------- */
/*                              Providers                                     */
/* -------------------------------------------------------------------------- */

const googleProvider = new GoogleAuthProvider();

// Optional but recommended: always show account chooser
googleProvider.setCustomParameters({
  prompt: "select_account",
});

/* -------------------------------------------------------------------------- */
/*                              Auth Methods                                  */
/* -------------------------------------------------------------------------- */

export const signUpWithEmail = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signInWithEmail = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signInWithGoogle = async (): Promise<UserCredential> => {
  return signInWithPopup(auth, googleProvider);
};

/**
 * Signs out the current Firebase user
 * NOTE: This only logs out Firebase.
 * Backend session must be cleared separately.
 */
export const firebaseSignOut = async (): Promise<void> => {
  await firebaseAuthSignOut(auth);
};
