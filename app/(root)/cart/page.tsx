'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
// 1. Change Import: Use the hook, not the component
import { useRazorpayCheckout } from "@/lib/hooks/useRazorpayCheckout";
import { Loader2 } from "lucide-react"; // Optional: for icons

// Types
type CartItem = {
  name: string;
  price: string;
  period: string;
  description: string;
};

type Coupon = {
  code: string;
  discount: number;
  isValid: boolean;
};

type PaymentStatus = 'idle' | 'processing' | 'success' | 'error';

export default function Cart() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams?.get('plan');

  // State
  const [cartItem, setCartItem] = useState<CartItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  // Coupon State
  const [coupon, setCoupon] = useState<Coupon>({ code: "", discount: 0, isValid: false });
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  
  // Animation State
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Payment State
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [paymentError, setPaymentError] = useState("");
  
  // 2. Initialize the Hook
  const { isReady, startPayment } = useRazorpayCheckout();

  // Refs
  const cartRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const proceedBtnRef = useRef<HTMLButtonElement>(null);

  // --- EFFECTS (Animations & Scroll) ---
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    createParticles();
  }, []);

  // --- LOGIC: Particles ---
  const createParticles = () => {
    const particlesContainer = document.getElementById("particles");
    if (!particlesContainer) return;
    // Clear existing to prevent duplicates on re-render
    particlesContainer.innerHTML = ''; 
    
    const particleCount = 30;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.classList.add("particle");
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      const size = Math.random() * 5 + 1;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      const duration = Math.random() * 20 + 10;
      const delay = Math.random() * 10;
      particle.style.animation = `float ${duration}s ${delay}s infinite linear`;
      particlesContainer.appendChild(particle);
    }
  };

  // --- LOGIC: Auth & Plan Loading ---
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserEmail(user ? user.email : null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (planParam) {
      setTimeout(() => {
        const plans = {
          essential: { 
            name: "Essential", 
            price: "1.00", // CHANGED FROM "0.02" TO "1.00" (Minimum allowed)
            period: "/project", 
            description: "Foundation for emerging brands" 
          },
          professional: { 
            name: "Professional", 
            price: "7,50,000", 
            period: "/project", 
            description: "Comprehensive design solution" 
          },
          enterprise: { 
            name: "Enterprise", 
            price: "15,00,000", 
            period: "/project", 
            description: "Bespoke design partnership" 
          }
        };
        const selectedPlan = plans[planParam as keyof typeof plans];
        if (selectedPlan) {
          setCartItem(selectedPlan);
          setTimeout(() => document.querySelector('.cart-item')?.classList.add('animate-in'), 300);
        }
        setLoading(false);
      }, 1200);
    } else {
      setLoading(false);
    }
  }, [planParam]);

  // --- LOGIC: Coupon ---
  const applyCoupon = () => {
    if (!couponInput.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }
    setCouponLoading(true);
    setCouponError("");
    setTimeout(() => {
      const validCoupons: Record<string, number> = { "NEW2025": 10, "PREMIUM50": 50, "MASTERCRAFT25": 25 };
      const discountAmount = validCoupons[couponInput.toUpperCase()];
      if (discountAmount) {
        setCoupon({ code: couponInput.toUpperCase(), discount: discountAmount, isValid: true });
        setCouponInput("");
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
      } else {
        setCouponError("Invalid coupon code");
      }
      setCouponLoading(false);
    }, 1500);
  };

  const removeCoupon = () => setCoupon({ code: "", discount: 0, isValid: false });

  // --- LOGIC: Price Calculation ---
  const calculateFinalPrice = () => {
    if (!cartItem) return { original: "0", discounted: "0", savings: "0" };
    const price = parseFloat(cartItem.price.replace(/,/g, ""));
    const discountAmount = price * (coupon.discount / 100);
    const finalPrice = price - discountAmount;
    return {
      original: price.toLocaleString('en-IN'),
      discounted: finalPrice.toLocaleString('en-IN'),
      savings: discountAmount.toLocaleString('en-IN')
    };
  };

  const priceData = calculateFinalPrice();
  // We need the string for display, but the number for Razorpay
  const finalAmountString = coupon.isValid ? priceData.discounted : priceData.original;

  // --- LOGIC: Payment Trigger (The Fix) ---
  const handleProceedToPayment = async () => {
    if (!isReady || !cartItem) {
      setPaymentError("Payment system loading...");
      return;
    }

    setPaymentStatus('processing');
    setPaymentError("");

    try {
      // 1. Clean the amount string (remove commas) and convert to Number
      const amountClean = parseFloat(finalAmountString.replace(/,/g, ""));
      
      // 2. Razorpay expects amount in paise (multiply by 100)
      const amountInPaise = Math.round(amountClean * 100);

      // 3. Call the Hook
      await startPayment({
        amount: amountInPaise,
        currency: "INR",
        name: cartItem.name,
        description: cartItem.description,
        prefill: {
          email: userEmail || undefined,
        },
        // Callback handlers
        onSuccess: (data: any) => {
          setPaymentStatus('success');
          // Redirect to your summary page with the ID
          router.push(`/payment-summary?paymentId=${data.razorpay_payment_id}`);
        },
        onError: (error: any) => {
          setPaymentStatus('error');
          setPaymentError(error?.description || "Payment failed");
          setTimeout(() => setPaymentStatus('idle'), 3000);
        }
      });
    } catch (err) {
      console.error("Payment Start Error:", err);
      setPaymentStatus('error');
      setPaymentError("Could not initialize payment.");
    }
  };

  return (
    <>
      <div id="particles" className="particles"></div>
      
      <div className="hero-bg">
        <div className="hero-blob blob-1" style={{ transform: `translate(${mousePosition.x * 50}px, ${mousePosition.y * 50}px)` }}></div>
        <div className="hero-blob blob-2" style={{ transform: `translate(${-mousePosition.x * 50}px, ${-mousePosition.y * 50}px)` }}></div>
      </div>
      
      <div className="container">
        <header>
          <nav>
            <div className="logo">MASTERCRAFT</div>
            <div className="nav-links">
              <button className="back-btn" onClick={() => router.push("/")}>
                <span className="back-arrow">←</span> Back to Services
              </button>
            </div>
          </nav>
        </header>

        <main className="cart-page">
          {/* Header */}
          <div className="cart-header animate-fadeIn">
            <h1>Complete Your Order</h1>
            <div className="cart-subtitle">
              <span className="highlight-text">Secure Checkout</span>
              {/* SVG Secure Icon */}
            </div>
          </div>

          <div className="cart-layout">
            {/* LEFT SIDE: Cart Items */}
            <div className="cart-items-section" ref={cartRef} style={{ transform: `translateY(${scrollY * 0.05}px)` }}>
              <div className="cart-section-header">
                <h2>Your Selection</h2>
                {userEmail && (
                  <div className="user-info">
                    <span>{userEmail}</span>
                  </div>
                )}
              </div>

              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading your selection...</p>
                </div>
              ) : (
                <>
                  {cartItem ? (
                    <div className="cart-item">
                      <div className="item-header">
                        <div className="item-plan">
                          <h3>{cartItem.name}</h3>
                          <span className="plan-period">{cartItem.period}</span>
                        </div>
                        <div className="item-price">₹{cartItem.price}</div>
                      </div>
                      <p className="item-description">{cartItem.description}</p>
                    </div>
                  ) : (
                    <div className="empty-cart">
                      <h3>Your cart is empty</h3>
                      <button className="btn btn-primary empty-cart-btn" onClick={() => router.push("/")}>View Services</button>
                    </div>
                  )}
                </>
              )}

              {/* Coupon UI */}
              {cartItem && (
                <div className="coupon-section">
                  <h3>Have a coupon?</h3>
                  {coupon.isValid ? (
                    <div className="applied-coupon">
                       <span className="coupon-code">{coupon.code}</span>
                       <span className="discount-text">{coupon.discount}% OFF</span>
                       <button className="remove-coupon" onClick={removeCoupon}>×</button>
                    </div>
                  ) : (
                    <div className="coupon-input-group">
                      <input 
                        type="text" placeholder="Enter coupon code" 
                        value={couponInput} 
                        onChange={(e) => setCouponInput(e.target.value)} 
                        className={couponError ? "error" : ""}
                      />
                      <button className="apply-coupon" onClick={applyCoupon} disabled={couponLoading}>
                        {couponLoading ? "..." : "Apply"}
                      </button>
                    </div>
                  )}
                  {couponError && <span className="error-message" style={{color: 'var(--destructive)', fontSize:'0.85rem'}}>{couponError}</span>}
                </div>
              )}
            </div>

            {/* RIGHT SIDE: Summary */}
            {cartItem && (
              <div className="order-summary-section" ref={summaryRef} style={{ transform: `translateY(${scrollY * -0.05}px)` }}>
                <div className="summary-wrapper">
                  <h2>Order Summary</h2>
                  
                  <div className="summary-rows">
                    <div className="summary-row">
                      <span>Subtotal</span>
                      <span>₹{priceData.original}</span>
                    </div>
                    {coupon.isValid && (
                      <div className="summary-row discount">
                        <span>Discount ({coupon.discount}%)</span>
                        <span>- ₹{priceData.savings}</span>
                      </div>
                    )}
                    <div className="summary-row gst">
                      <span>GST (18%)</span>
                      <span>Included</span>
                    </div>
                    <div className="summary-divider"></div>
                    <div className="summary-row total">
                      <span>Total</span>
                      <span>₹{finalAmountString}</span>
                    </div>
                  </div>

                  <div className="payment-safety">
                     <span className="safety-text">100% Secure Transaction</span>
                  </div>
                  
                  <button 
                    className={`btn btn-proceed ${paymentStatus === 'processing' ? 'processing' : ''}`} 
                    ref={proceedBtnRef}
                    onClick={handleProceedToPayment}
                    disabled={paymentStatus === 'processing' || !isReady}
                  >
                    {paymentStatus === 'processing' ? (
                       <span>Processing...</span>
                    ) : (
                      <>
                        <span>Proceed to Payment</span>
                        <span className="btn-arrow">→</span>
                      </>
                    )}
                  </button>

                  {paymentStatus === 'error' && (
                    <div className="payment-error">
                      <span>{paymentError || "Payment failed. Please try again."}</span>
                    </div>
                  )}
                  
                </div>
              </div>
            )}
          </div>
        </main>
        
        {/* Footer */}
        <footer>
          <div className="footer-content">
             <div className="footer-logo">MASTERCRAFT</div>
          </div>
        </footer>
      </div>

      {/* Success Toast */}
      <div className={`success-toast ${showSuccessToast ? 'show' : ''}`}>
        <span>Coupon applied successfully!</span>
      </div>

      {/* Your Original CSS (Inline) */}
      <style jsx>{`
        /* ... Copy your original CSS here, it was perfect ... */
        :root { --radius: 0.625rem; --background: #111; --foreground: #fff; --primary-200: #818cf8; --destructive: #ef4444; }
        .container { max-width: 1400px; margin: 0 auto; padding: 2rem; position: relative; z-index: 1; }
        .cart-page { padding: 2rem 0 4rem; }
        .cart-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        .cart-items-section, .order-summary-section { background: rgba(30,30,30,0.5); border-radius: 24px; padding: 2rem; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px); }
        .btn-proceed { width: 100%; padding: 1rem; background: var(--primary-200); color: black; border-radius: 12px; font-weight: bold; cursor: pointer; border: none; margin-top: 1rem; }
        .btn-proceed:disabled { opacity: 0.5; }
        .payment-error { color: var(--destructive); margin-top: 1rem; text-align: center; }
        /* Add the rest of your CSS from the previous file */
      `}</style>
    </>
  );
}