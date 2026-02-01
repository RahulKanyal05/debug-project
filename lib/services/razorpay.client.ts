// lib/services/razorpay.client.ts

export const loadRazorpayScript = () => {
  return new Promise<boolean>((resolve) => {
    // 1. Check if Razorpay is already loaded
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve(true);
      return;
    }

    // 2. Create the script tag
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    // 3. Handle success
    script.onload = () => {
      resolve(true);
    };

    // 4. Handle failure
    script.onerror = () => {
      console.error("Razorpay SDK failed to load.");
      resolve(false);
    };

    // 5. Add to document
    document.body.appendChild(script);
  });
};