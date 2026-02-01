'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { firebaseSignOut } from "@/lib/auth/auth.firebase";
import { signOutAction } from "@/lib/actions/auth.action";
import { toast } from "sonner";

import { motion, AnimatePresence } from 'framer-motion';

interface NavLink {
  name: string;
  href: string;
}

const navLinks: NavLink[] = [
  { name: 'Home', href: '/' },
  { name: 'Practice Interview', href: '/practice-interview' },
  { name: 'Practice Introduction', href: '/practice-introduction' },
  { name: 'Services', href: '/services' },
  { name: 'About', href: '/about' },
  { name: 'Payment-Summary', href: '/payment-summary' },
];

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  const handleSignOut = async () => {
  try {
    // 1. Firebase sign out
    await firebaseSignOut();

    // 2. Backend session cleanup
    await signOutAction();

    toast.success("Signed out successfully");

    // 3. Navigate + revalidate
    router.replace("/sign-in");
    router.refresh();
  } catch (error) {
    console.error("Error signing out:", error);
    toast.error("Failed to sign out");
  }
};


  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname === '/sign-in' || pathname === '/sign-up') return null;

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'backdrop-blur-md bg-gray-900/70 shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
            <span className="text-2xl font-bold text-cyan-400 hover:text-cyan-300 transition duration-300">
              MentoraAI
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`relative text-sm font-medium transition duration-300 group ${
                  pathname === link.href ? 'text-cyan-400' : 'text-white hover:text-cyan-300'
                }`}
              >
                {link.name}
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-cyan-400 transition-all group-hover:w-full"></span>
              </Link>
            ))}
            <button
              onClick={handleSignOut}
              className="ml-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-md text-sm font-semibold shadow-md transition duration-300"
            >
              Sign Out
            </button>
          </div>

          {/* Hamburger for Mobile */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-gray-900/95 px-4 pb-6 space-y-3 shadow-md"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={toggleMobileMenu}
                className={`block text-base transition px-2 py-2 rounded-md ${
                  pathname === link.href
                    ? 'text-cyan-400 bg-gray-800'
                    : 'text-gray-300 hover:text-cyan-400 hover:bg-gray-800'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <button
              onClick={() => {
                handleSignOut();
                toggleMobileMenu();
              }}
              className="w-full text-left bg-gradient-to-r from-red-600 to-pink-500 hover:from-red-700 hover:to-pink-600 text-white px-4 py-2 rounded-md text-sm mt-2 shadow-sm"
            >
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
