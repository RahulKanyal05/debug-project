import Vapi from "@vapi-ai/web";

const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

if (!publicKey) {
  console.error("Missing NEXT_PUBLIC_VAPI_PUBLIC_KEY in .env.local");
}

export const vapi = new Vapi(publicKey || "dummy-key-to-prevent-crash");