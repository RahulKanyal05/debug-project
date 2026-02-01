// app/layout.tsx

import { Mona_Sans } from "next/font/google";
import "./globals.css";  // Your global CSS
import "../styles/nprogress.css"; // Make sure you import the nprogress styles
import Navbar from "@/components/layout/Navbar"; // Navbar import
import { Toaster } from "sonner";
import RouteLoader from "@/components/layout/RouteLoader"; // Import RouteLoader component

const isSignedIn = true; // Replace with your authentication logic

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "MentoraAI",
  description: "An AI-powered platform for preparing for mock interviews",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${monaSans.className} antialiased`}>
        <RouteLoader /> {/* Use RouteLoader to show loading indicator */}
        {isSignedIn && <Navbar />}
        <main className={`${isSignedIn ? "pt-16" : ""}`}>
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
