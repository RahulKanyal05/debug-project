'use client';
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Head from "next/head";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import RazorpayCheckout from "../../components/RazorpayCheckout";

// Define types for our cart components
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
  // Router and search params
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams?.get('plan');

  // State management
  const [cartItem, setCartItem] = useState<CartItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [coupon, setCoupon] = useState<Coupon>({ code: "", discount: 0, isValid: false });
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [paymentError, setPaymentError] = useState("");
  
  // Store payment data
  const [paymentData, setPaymentData] = useState<any>(null);

  // Refs for animations
  const cartRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const proceedBtnRef = useRef<HTMLButtonElement>(null);
  
  // Animation state
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Effect for handling scroll animations
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Effect for mouse tracking
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    }

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Effect for particle animations
  useEffect(() => {
    createParticles();
  }, []);

  // Create floating particles for background
  const createParticles = () => {
    const particlesContainer = document.getElementById("particles");
    if (!particlesContainer) return;
    
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.classList.add("particle");
      
      // Random position
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      
      // Random size
      const size = Math.random() * 5 + 1;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Random animation duration and delay
      const duration = Math.random() * 20 + 10;
      const delay = Math.random() * 10;
      particle.style.animation = `float ${duration}s ${delay}s infinite linear`;
      
      particlesContainer.appendChild(particle);
    }
  };

  // Effect for hover animations on cart elements
  useEffect(() => {
    const elements = [cartRef.current, summaryRef.current];
    
    elements.forEach((el) => {
      if (!el) return;
      
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = (e as MouseEvent).clientX - rect.left;
        const y = (e as MouseEvent).clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const angleX = (y - centerY) / 30;
        const angleY = (centerX - x) / 30;
        
        el.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale(1.01)`;
      });
      
      el.addEventListener("mouseleave", () => {
        el.style.transform = "";
        setTimeout(() => {
          el.style.transform = "rotateY(0) rotateX(0) scale(1)";
        }, 100);
      });
    });

    // Special effect for the proceed button
    if (proceedBtnRef.current) {
      proceedBtnRef.current.addEventListener("mousemove", (e) => {
        const rect = proceedBtnRef.current!.getBoundingClientRect();
        const x = (e as MouseEvent).clientX - rect.left;
        const y = (e as MouseEvent).clientY - rect.top;
        
        // Update the gradient position
        proceedBtnRef.current!.style.setProperty('--x', `${x}px`);
        proceedBtnRef.current!.style.setProperty('--y', `${y}px`);
      });
    }
  }, [cartItem]);

  // Firebase auth state
  useEffect(() => {
    const auth = getAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        setUserEmail(null);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Get pricing plan based on URL param
  useEffect(() => {
    if (planParam) {
      // Simulating API call to get plan details
      setTimeout(() => {
        const plans = {
          essential: {
            name: "Essential",
            price: "0.02",
            period: "/project",
            description: "Foundation for emerging brands seeking professional design excellence"
          },
          professional: {
            name: "Professional",
            price: "7,50,000",
            period: "/project",
            description: "Comprehensive design solution for established businesses ready to elevate"
          },
          enterprise: {
            name: "Enterprise",
            price: "15,00,000",
            period: "/project",
            description: "Bespoke design partnership for industry leaders demanding excellence"
          }
        };
        
        const selectedPlan = plans[planParam as keyof typeof plans];
        
        if (selectedPlan) {
          setCartItem(selectedPlan);
          // Animate in the item
          setTimeout(() => {
            const cartItemEl = document.querySelector('.cart-item');
            if (cartItemEl) {
              cartItemEl.classList.add('animate-in');
            }
          }, 300);
        }
        
        setLoading(false);
      }, 1200);
    } else {
      setLoading(false);
    }
  }, [planParam]);

  // Apply coupon handler
  const applyCoupon = () => {
    if (!couponInput.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }
    
    setCouponLoading(true);
    setCouponError("");
    
    // Simulate API validation
    setTimeout(() => {
      const validCoupons = {
        "NEW2025": 10,
        "PREMIUM50": 50,
        "MASTERCRAFT25": 25
      };
      
      const discountAmount = validCoupons[couponInput.toUpperCase() as keyof typeof validCoupons];
      
      if (discountAmount) {
        setCoupon({
          code: couponInput.toUpperCase(),
          discount: discountAmount,
          isValid: true
        });
        setCouponInput("");
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
      } else {
        setCouponError("Invalid coupon code");
      }
      
      setCouponLoading(false);
    }, 1500);
  };

  // Calculate final price
  const calculateFinalPrice = () => {
    if (!cartItem) return { original: "0", discounted: "0", savings: "0" };
    
    // Remove commas and convert to number
    const price = parseFloat(cartItem.price.replace(/,/g, ""));
    
    // Calculate discount
    const discountAmount = price * (coupon.discount / 100);
    const finalPrice = price - discountAmount;
    
    // Format back with commas
    return {
      original: price.toLocaleString(),
      discounted: finalPrice.toLocaleString(),
      savings: discountAmount.toLocaleString()
    };
  };

  // Remove coupon handler
  const removeCoupon = () => {
    setCoupon({ code: "", discount: 0, isValid: false });
  };

  // Get price calculations
  const priceData = calculateFinalPrice();

  // Get the final amount to charge
  const finalAmount = coupon.isValid ? priceData.discounted : priceData.original;

  // Initialize Razorpay checkout
  const { handlePayment, isReady } = RazorpayCheckout({
    amount: finalAmount,
    userEmail,
    onPaymentStart: () => {
      setPaymentStatus('processing');
      setPaymentError("");
    },
    onPaymentSuccess: (data) => {
      setPaymentStatus('success');
      setPaymentData(data);
    },
    onPaymentError: (error) => {
      setPaymentStatus('error');
      setPaymentError(error);
      setTimeout(() => {
        setPaymentStatus('idle');
      }, 3000);
    },
    onPaymentCancel: () => {
      setPaymentStatus('idle');
    }
  });

  // Handle proceed to payment
  const handleProceedToPayment = () => {
    if (!isReady) {
      setPaymentError("Payment system is loading. Please try again in a moment.");
      setPaymentStatus('error');
      setTimeout(() => {
        setPaymentStatus('idle');
      }, 3000);
      return;
    }
    
    handlePayment();
  };

  return (
    <>
      <Head>
        <title>Your Cart | Mastercraft Design</title>
        <meta name="description" content="Complete your premium design service purchase" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div id="particles" className="particles"></div>
      
      <div className="hero-bg">
        <div 
          className="hero-blob blob-1" 
          style={{ 
            transform: `translate(${mousePosition.x * 50}px, ${mousePosition.y * 50}px)` 
          }}
        ></div>
        <div 
          className="hero-blob blob-2" 
          style={{ 
            transform: `translate(${-mousePosition.x * 50}px, ${-mousePosition.y * 50}px)` 
          }}
        ></div>
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
          <div className="cart-header animate-fadeIn">
            <h1>Complete Your Order</h1>
            <div className="cart-subtitle">
              <span className="highlight-text">Secure Checkout</span>
              <span className="secure-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 11H5V21H19V11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17 9V7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </div>
          </div>

          <div className="cart-layout">
            {/* Cart Items Section */}
            <div 
              className="cart-items-section" 
              ref={cartRef}
              style={{
                transform: `translateY(${scrollY * 0.05}px)`
              }}
            >
              <div className="cart-section-header">
                <h2>Your Selection</h2>
                {userEmail && (
                  <div className="user-info">
                    <div className="user-info-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
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
                      <div className="item-footer">
                        <div className="item-quality">
                          <span className="quality-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                          <span>Premium Quality</span>
                        </div>
                        <div className="item-delivery">
                          <span className="delivery-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M22 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M12 2V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M17 3L12 12L17 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M7 3L12 12L7 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                          <span>Priority Delivery</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-cart">
                      <div className="empty-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 3H5L5.4 5M5.4 5H21L17 13H7M5.4 5L7 13M7 13L5.2 15H17M9 19C9 19.5523 8.55228 20 8 20C7.44772 20 7 19.5523 7 19C7 18.4477 7.44772 18 8 18C8.55228 18 9 18.4477 9 19ZM17 19C17 19.5523 16.5523 20 16 20C15.4477 20 15 19.5523 15 19C15 18.4477 15.4477 18 16 18C16.5523 18 17 18.4477 17 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <h3>Your cart is empty</h3>
                      <p>Browse our premium design services and select a plan to get started.</p>
                      <button 
                        className="btn btn-primary empty-cart-btn"
                        onClick={() => router.push("/")}
                      >
                        View Services
                      </button>
                    </div>
                  )}
                </>
              )}

              {cartItem && (
                <div className="coupon-section">
                  <h3>Have a coupon?</h3>
                  {coupon.isValid ? (
                    <div className="applied-coupon">
                      <div className="coupon-info">
                        <div className="coupon-tag">
                          <span className="coupon-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M21 12V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                          <span className="coupon-code">{coupon.code}</span>
                        </div>
                        <span className="discount-text">{coupon.discount}% OFF</span>
                      </div>
                      <button className="remove-coupon" onClick={removeCoupon}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="coupon-input-group">
                      <div className="input-wrapper">
                        <input 
                          type="text" 
                          placeholder="Enter coupon code" 
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          className={couponError ? "error" : ""}
                        />
                        {couponError && <span className="error-message">{couponError}</span>}
                      </div>
                      <button 
                        className="apply-coupon" 
                        onClick={applyCoupon}
                        disabled={couponLoading}
                      >
                        {couponLoading ? (
                          <span className="btn-spinner"></span>
                        ) : "Apply"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Order Summary Section */}
            {cartItem && (
              <div 
                className="order-summary-section" 
                ref={summaryRef}
                style={{
                  transform: `translateY(${scrollY * -0.05}px)`
                }}
              >
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
                      <span>₹{finalAmount}</span>
                    </div>
                  </div>
                  
                  <div className="payment-safety">
                    <div className="safety-icons">
                      <span className="safety-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      <span className="safety-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      <span className="safety-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 17H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 4V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </div>
                    <span className="safety-text">100% Secure Transaction</span>
                  </div>
                  
                  <button 
                    className={`btn btn-proceed ${paymentStatus === 'processing' ? 'processing' : ''}`} 
                    ref={proceedBtnRef}
                    onClick={handleProceedToPayment}
                    disabled={paymentStatus === 'processing' || !cartItem || !isReady}
                  >
                    {paymentStatus === 'processing' ? (
                      <>
                        <span className="btn-spinner"></span>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>Proceed to Payment</span>
                        <span className="btn-arrow">→</span>
                      </>
                    )}
                  </button>

                  {paymentStatus === 'error' && (
                    <div className="payment-error">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>{paymentError || "Payment failed. Please try again."}</span>
                    </div>
                  )}
                  
                  <div className="payment-methods">
                    <div className="payment-method-label">Accepted Payment Methods:</div>
                    <div className="payment-method-icons">
                      <span className="payment-method-icon">
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="1" y="5" width="26" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                          <path d="M1 10H27" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </span>
                      <span className="payment-method-icon">
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M23 9H5C3.89543 9 3 9.89543 3 11V21C3 22.1046 3.89543 23 5 23H23C24.1046 23 25 22.1046 25 21V11C25 9.89543 24.1046 9 23 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M3 15H25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M7 5L14 9L21 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      <span className="payment-method-icon">
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14 22C18.4183 22 22 18.4183 22 14C22 9.58172 18.4183 6 14 6C9.58172 6 6 9.58172 6 14C6 18.4183 9.58172 22 14 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M18 10C17.5 9.5 16.5 9 15.5 9C14.5 9 14 9.5 14 10C14 11.5 16 11.5 16 13C16 13.5 15.5 14 14.5 14C13.5 14 12.5 13.5 12 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M15 9V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M15 14V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      <span className="payment-method-icon razorpay-icon">
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13.6 8L6 18H13.6L17.2 8H13.6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                          <path d="M10.5 13L14 8L22 18H14L10.5 13Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        <footer>
          <div className="footer-content">
            <div className="footer-logo">MASTERCRAFT</div>
            <p className="footer-text">Creating world-class digital experiences since 2002</p>
            <div className="footer-links">
              <a href="#">Privacy Policy</a>
              <span className="divider">•</span>
              <a href="#">Terms of Service</a>
              <span className="divider">•</span>
              <a href="#">Contact Support</a>
            </div>
          </div>
        </footer>
      </div>

      {/* Success Toast for Coupon */}
      <div className={`success-toast ${showSuccessToast ? 'show' : ''}`}>
        <span className="toast-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 12V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        <span>Coupon applied successfully!</span>
      </div>

      <style jsx>{`
        /* CSS Variables */
        :root {
          --radius: 0.625rem;
          --background: oklch(0.145 0 0);
          --foreground: oklch(0.985 0 0);
          --card: oklch(0.205 0 0);
          --card-foreground: oklch(0.985 0 0);
          --primary: oklch(0.922 0 0);
          --primary-foreground: oklch(0.205 0 0);
          --secondary: oklch(0.269 0 0);
          --secondary-foreground: oklch(0.985 0 0);
          --muted: oklch(0.269 0 0);
          --muted-foreground: var(--light-100);
          --accent: oklch(0.269 0 0);
          --accent-foreground: oklch(0.985 0 0);
          --destructive: oklch(0.704 0.191 22.216);
          --border: oklch(1 0 0 / 10%);
          --input: oklch(1 0 0 / 15%);
          --ring: oklch(0.556 0 0);
          --color-primary-100: #dddfff;
          --color-primary-200: #cac5fe;
          --color-light-100: #d6e0ff;
          --color-dark-100: #020408;
          --color-dark-200: #27282f;
          --color-dark-300: #242633;
          --font-mona-sans: "Mona Sans", sans-serif;
        }

        /* Global Styles */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: var(--font-mona-sans), -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
            Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
        }

        body {
          background: var(--background);
          color: var(--foreground);
          min-height: 100vh;
          overflow-x: hidden;
          background-image: 
            radial-gradient(circle at 10% 10%, rgba(70, 70, 120, 0.05) 0%, transparent 60%),
            radial-gradient(circle at 90% 90%, rgba(100, 100, 160, 0.05) 0%, transparent 60%);
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          position: relative;
          z-index: 1;
        }

        /* Header Styles */
        header {
          padding: 2rem 0;
          position: relative;
        }

        nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-size: 1.5rem;
          font-weight: 600;
          letter-spacing: 1px;
          background: linear-gradient(135deg, var(--color-primary-100), var(--color-primary-200));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .nav-links {
          display: flex;
          align-items: center;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: none;
          color: var(--color-light-100);
          font-size: 0.95rem;
          opacity: 0.8;
          cursor: pointer;
          transition: opacity 0.3s;
          padding: 8px 16px;
        }

        .back-btn:hover {
          opacity: 1;
        }

        .back-arrow {
          font-size: 1.2rem;
          position: relative;
          top: -1px;
        }

        /* Cart Page Styles */
        .cart-page {
          padding: 2rem 0 4rem;
        }

        .cart-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .cart-header h1 {
          font-size: 2.8rem;
          font-weight: 700;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #ffffff 0%, var(--color-primary-100) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          line-height: 1.2;
        }

        .cart-subtitle {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 1.1rem;
          color: var(--color-light-100);
          opacity: 0.9;
        }

        .highlight-text {
          color: var(--color-primary-100);
          font-weight: 500;
        }

        .secure-icon {
          display: flex;
          align-items: center;
          color: var(--color-primary-200);
        }

        /* Cart Layout */
        .cart-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          position: relative;
        }

        @media (max-width: 980px) {
          .cart-layout {
            grid-template-columns: 1fr;
          }
        }

        /* Cart Items Section */
        .cart-items-section {
          background: linear-gradient(145deg, rgba(25, 27, 32, 0.7), rgba(15, 17, 22, 0.7));
          border-radius: 24px;
          padding: 2rem;
          height: fit-content;
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.5s ease;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          will-change: transform;
          position: relative;
          overflow: hidden;
        }

        .cart-items-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, var(--color-primary-200), transparent);
          opacity: 0.7;
        }

        .cart-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .cart-section-header h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #ffffff;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          color: var(--color-light-100);
          opacity: 0.9;
          background: rgba(255, 255, 255, 0.1);
          padding: 8px 16px;
          border-radius: 50px;
          backdrop-filter: blur(5px);
        }

        .user-info-icon {
          display: flex;
          align-items: center;
          color: var(--color-primary-200);
        }

        /* Loading State */
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 0;
          gap: 1.5rem;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          border-top-color: var(--color-primary-200);
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-state p {
          color: var(--color-light-100);
          opacity: 0.8;
          font-size: 1rem;
        }

        /* Empty Cart */
        .empty-cart {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 0;
          text-align: center;
          gap: 1.5rem;
        }

        .empty-icon {
          color: var(--color-primary-200);
          opacity: 0.7;
          font-size: 2rem;
        }

        .empty-cart h3 {
          font-size: 1.5rem;
          color: #ffffff;
          font-weight: 600;
        }

        .empty-cart p {
          color: var(--color-light-100);
          opacity: 0.8;
          font-size: 1rem;
          max-width: 300px;
          margin: 0 auto;
        }

        .empty-cart-btn {
          margin-top: 1rem;
        }

        /* Cart Item */
        .cart-item {
          background: linear-gradient(145deg, rgba(32, 34, 40, 0.5), rgba(22, 24, 30, 0.5));
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.05);
          transform: translateY(20px);
          opacity: 0;
          transition: transform 0.5s ease, opacity 0.5s ease;
          position: relative;
          overflow: hidden;
        }

        .cart-item.animate-in {
          transform: translateY(0);
          opacity: 1;
        }

        .cart-item::after {
          content: '';
          position: absolute;
          bottom: 0;
          right: 0;
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, rgba(202, 197, 254, 0.1), transparent 70%);
          border-radius: 50%;
          opacity: 0.5;
          pointer-events: none;
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .item-plan h3 {
          font-size: 1.3rem;
          font-weight: 600;
          color: #ffffff;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .plan-period {
          font-size: 0.85rem;
          color: var(--color-light-100);
          opacity: 0.7;
          margin-left: 8px;
        }

        .item-price {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--color-primary-100);
        }

        .item-description {
          font-size: 0.95rem;
          color: var(--color-light-100);
          opacity: 0.8;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }

        .item-footer {
          display: flex;
          gap: 1.5rem;
        }

        .item-quality, .item-delivery {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: var(--color-light-100);
          opacity: 0.7;
        }

        .quality-icon, .delivery-icon {
          display: flex;
          align-items: center;
          color: var(--color-primary-200);
        }

        /* Coupon Section */
        .coupon-section {
          margin-top: 2rem;
        }

        .coupon-section h3 {
          font-size: 1.1rem;
          font-weight: 500;
          color: #ffffff;
          margin-bottom: 1rem;
        }

        .coupon-input-group {
          display: flex;
          gap: 0.5rem;
        }

        .input-wrapper {
          flex: 1;
          position: relative;
        }

        .coupon-input-group input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #ffffff;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .coupon-input-group input:focus {
          outline: none;
          border-color: var(--color-primary-200);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 2px rgba(202, 197, 254, 0.2);
        }

        .coupon-input-group input.error {
          border-color: var(--destructive);
        }

        .error-message {
          position: absolute;
          bottom: -22px;
          left: 0;
          font-size: 0.85rem;
          color: var(--destructive);
        }

        .apply-coupon {
          padding: 0 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: #ffffff;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 100px;
        }

        .apply-coupon:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .apply-coupon:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #ffffff;
          animation: spin 1s ease-in-out infinite;
        }

        /* Applied Coupon */
        .applied-coupon {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(202, 197, 254, 0.1);
          border: 1px solid rgba(202, 197, 254, 0.2);
          border-radius: 8px;
          padding: 12px 16px;
          animation: fadeIn 0.5s ease;
        }

        .coupon-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .coupon-tag {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .coupon-icon {
          display: flex;
          align-items: center;
          color: var(--color-primary-200);
        }

        .coupon-code {
          font-weight: 600;
          color: #ffffff;
        }

        .discount-text {
          font-size: 0.85rem;
          background: linear-gradient(135deg, var(--color-primary-100), var(--color-primary-200));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          font-weight: 600;
        }

        .remove-coupon {
          background: none;
          border: none;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-light-100);
          opacity: 0.7;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .remove-coupon:hover {
          opacity: 1;
          color: var(--destructive);
        }

        /* Order Summary Section */
        .order-summary-section {
          background: linear-gradient(145deg, rgba(25, 27, 32, 0.7), rgba(15, 17, 22, 0.7));
          border-radius: 24px;
          height: fit-content;
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.5s ease;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          will-change: transform;
          position: relative;
          overflow: hidden;
        }

        .order-summary-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, var(--color-primary-200), transparent);
          opacity: 0.7;
        }

        .summary-wrapper {
          padding: 2rem;
        }

        .order-summary-section h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 2rem;
        }

        .summary-rows {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 1rem;
          color: var(--color-light-100);
        }

        .summary-row.discount {
          color: var(--color-primary-100);
        }

        .summary-row.gst {
          font-size: 0.9rem;
          opacity: 0.7;
        }

        .summary-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          margin: 1rem 0;
        }

        .summary-row.total {
          font-size: 1.3rem;
          font-weight: 600;
          color: #ffffff;
        }

        /* Payment Safety */
        .payment-safety {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          margin: 2rem 0;
        }

        .safety-icons {
          display: flex;
          gap: 12px;
        }

        .safety-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          color: var(--color-primary-200);
        }

        .safety-text {
          font-size: 0.85rem;
          color: var(--color-light-100);
          opacity: 0.8;
        }

        /* Payment Methods */
        .payment-methods {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          margin-top: 1.5rem;
        }
        
        .payment-method-label {
          font-size: 0.85rem;
          color: var(--color-light-100);
          opacity: 0.7;
        }
        
        .payment-method-icons {
          display: flex;
          justify-content: center;
          gap: 12px;
        }

        .payment-method-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-light-100);
          opacity: 0.6;
          transition: opacity 0.3s ease;
        }
        
        .razorpay-icon {
          opacity: 0.8;
          color: var(--color-primary-200);
        }

        .payment-method-icon:hover {
          opacity: 0.9;
        }

        /* Proceed Button */
        .btn-proceed {
          width: 100%;
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          background: linear-gradient(135deg, var(--color-primary-200), var(--color-primary-100));
          color: var(--color-dark-100);
          border: none;
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          --x: 0px;
          --y: 0px;
        }

        .btn-proceed:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(202, 197, 254, 0.3);
        }

        .btn-proceed:active {
          transform: translateY(1px);
        }

        .btn-proceed::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle 80px at var(--x) var(--y), rgba(255, 255, 255, 0.2), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .btn-proceed:hover::after {
          opacity: 1;
        }

        .btn-proceed:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        
        .btn-proceed.processing {
          background: linear-gradient(135deg, #a5a1cc, #9792d6);
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(202, 197, 254, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(202, 197, 254, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(202, 197, 254, 0);
          }
        }

        .btn-arrow {
          font-size: 1.2rem;
          transition: transform 0.3s ease;
        }

        .btn-proceed:hover .btn-arrow {
          transform: translateX(5px);
        }
        
        /* Payment Error */
        .payment-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          margin-top: 15px;
          border-radius: 8px;
          background: rgba(var(--destructive), 0.1);
          color: var(--destructive);
          animation: fadeIn 0.5s ease;
        }
        
        .payment-error svg {
          flex-shrink: 0;
        }

        /* Success Toast */
        .success-toast {
          position: fixed;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%) translateY(100px);
          background: rgba(34, 197, 94, 0.9);
          backdrop-filter: blur(10px);
          padding: 12px 24px;
          border-radius: 50px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #ffffff;
          font-size: 0.95rem;
          opacity: 0;
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s ease;
          z-index: 100;
          box-shadow: 0 10px 25px rgba(34, 197, 94, 0.3);
        }

        .success-toast.show {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }

        .toast-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Blobs/Gradients */
        .hero-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          z-index: -1;
        }

        .hero-blob {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.05;
          background: linear-gradient(135deg, var(--color-primary-200), transparent);
          pointer-events: none;
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .blob-1 {
          top: -200px;
          left: -200px;
        }

        .blob-2 {
          bottom: -300px;
          right: -200px;
          background: linear-gradient(135deg, var(--color-light-100), transparent);
        }

        /* Particles */
        .particles {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 0;
          pointer-events: none;
        }

        .particle {
          position: absolute;
          width: 3px;
          height: 3px;
          background-color: rgba(202, 197, 254, 0.3);
          border-radius: 50%;
          opacity: 0;
          animation: float 15s infinite linear;
        }

        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.5;
          }
          90% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-500px) translateX(100px);
            opacity: 0;
          }
        }

        /* Footer Section */
        footer {
          padding: 3rem 0;
          text-align: center;
          margin-top: 2rem;
        }

        .footer-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .footer-logo {
          font-size: 1.5rem;
          font-weight: 600;
          letter-spacing: 1px;
          background: linear-gradient(135deg, var(--color-primary-100), var(--color-primary-200));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          margin-bottom: 1rem;
        }

        .footer-text {
          color: var(--color-light-100);
          opacity: 0.7;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }

        .footer-links {
          display: flex;
          justify-content: center;
          gap: 12px;
          align-items: center;
        }

        .footer-links a {
          color: var(--color-light-100);
          opacity: 0.7;
          text-decoration: none;
          font-size: 0.85rem;
          transition: opacity 0.3s ease;
        }

        .footer-links a:hover {
          opacity: 1;
          color: var(--color-primary-100);
        }

        .divider {
          opacity: 0.4;
          font-size: 0.85rem;
        }

        /* Animations */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }

        /* Responsive Styles */
        @media (max-width: 768px) {
          .cart-header h1 {
            font-size: 2.2rem;
          }

          .cart-layout {
            grid-template-columns: 1fr;
          }

          .container {
            padding: 1rem;
          }
          
          .cart-page {
            padding: 1rem 0 3rem;
          }
          
          .cart-header {
            margin-bottom: 2rem;
          }
          
          .order-summary-section {
            margin-top: 2rem;
          }
        }

        @media (max-width: 480px) {
          .cart-header h1 {
            font-size: 1.8rem;
          }
          
          .cart-items-section,
          .order-summary-section {
            padding: 1.5rem;
            border-radius: 16px;
          }
          
          .coupon-input-group {
            flex-direction: column;
          }
          
          .item-footer {
            flex-direction: column;
            gap: 0.75rem;
          }
          
          .safety-icons {
            flex-wrap: wrap;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}