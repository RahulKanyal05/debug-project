'use client';
import { useState, useEffect, useRef, CSSProperties } from "react";
import Head from "next/head";
import { useRouter } from 'next/navigation';
import router from "next/router";


// Define types for pricing plans
type PricingPlan = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  featured?: boolean;
  badge?: string;
};

// Define the main component
export default function Home() {
  // State for blob animations
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Refs for cards to apply hover effects
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const router = useRouter();
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

  // Effect for creating particles
  useEffect(() => {
    createParticles();
  }, []);

  // Effect for card hover effects
  useEffect(() => {
    cardHoverEffects();
  }, []);

  // Function to create floating particles
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

  // Function for card hover effects
  const cardHoverEffects = () => {
    cardRefs.current.forEach((card) => {
      if (!card) return;
      
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e as MouseEvent).clientX - rect.left;
        const y = (e as MouseEvent).clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const angleX = (y - centerY) / 20;
        const angleY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) translateY(-10px)`;
      });
      
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
        setTimeout(() => {
          card.style.transform = "rotateY(0) rotateX(0) translateY(0)";
        }, 100);
      });
    });
  };

  // Pricing plans data
  const pricingPlans: PricingPlan[] = [
    {
      name: "Essential",
      price: "29",
      period: "/project",
      description: "Foundation for emerging brands seeking professional design excellence",
      features: [
        "Complete UI Design System",
        "5 Key User Journeys",
        "Responsive Design (3 Breakpoints)",
        "Basic Animation Concepts",
        "2 Revision Cycles"
      ],
      buttonText: "Get Started"
    },
    {
      name: "Professional",
      price: "7,50,000",
      period: "/project",
      description: "Comprehensive design solution for established businesses ready to elevate",
      features: [
        "Advanced Design System with Variables",
        "10 Detailed User Journeys",
        "Fully Responsive (5 Breakpoints)",
        "Custom Micro-interactions",
        "4 Revision Cycles",
        "User Testing Frameworks"
      ],
      buttonText: "Get Started",
      featured: true,
      badge: "Most Popular"
    },
    {
      name: "Enterprise",
      price: "15,00,000",
      period: "/project",
      description: "Bespoke design partnership for industry leaders demanding excellence",
      features: [
        "Enterprise-grade Design System",
        "Unlimited User Journeys",
        "Adaptive Design (All Devices)",
        "Advanced Animation Library",
        "Unlimited Revisions",
        "Full Research & Strategy",
        "Executive Presentation Support"
      ],
      buttonText: "Contact Us"
    }
  ];

  return (
    <>
      <Head>
        <title>Mastercraft Design | Premium UI/UX Services</title>
        <meta name="description" content="Premium UI/UX design services for transformative digital experiences" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div id="particles" className="particles"></div>
      
      <div className="container">
        <header>
          <nav>
            <div className="logo">MASTERCRAFT</div>
          </nav>
        </header>

        <section className="hero">
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
          <div className="hero-content animate-fadeIn">
            <h1>Elevate Your Digital Presence</h1>
            <p>Over two decades of design excellence, creating unparalleled user experiences that transcend the ordinary.</p>
          </div>
        </section>

        <section className="pricing-section">
          <div className="pricing-header animate-fadeIn">
            <h2>Premium Design Services</h2>
            <p>Select the perfect design package tailored to elevate your brand's digital presence</p>
          </div>

          <div className="pricing-container">
            {pricingPlans.map((plan, index) => (
              <div 
                key={plan.name}
                ref={el => cardRefs.current[index] = el}
                className={`pricing-card-wrapper animate-fadeIn delay-${(index + 1) * 100} rotate-on-hover`}
              >
                <div className={`pricing-card ${plan.featured ? 'featured' : ''}`}>
                  {plan.badge && <div className="card-badge">{plan.badge}</div>}
                  <h3 className="plan-name">{plan.name}</h3>
                  <div className="plan-price">
                    <span className="plan-currency">₹</span>{plan.price}
                    <span className="plan-period">{plan.period}</span>
                  </div>
                  <p className="plan-description">{plan.description}</p>
                  <ul className="features-list">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="feature-item">
                        <span className="feature-icon">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button 
      className={`btn ${plan.featured ? 'btn-primary' : 'btn-secondary'}`}
      onClick={() => router.push(`/cart?plan=${plan.name.toLowerCase()}`)}
    >
      {plan.buttonText}
    </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer>
          <div className="footer-content">
            <div className="footer-logo">MASTERCRAFT</div>
            <p className="footer-text">Creating world-class digital experiences since 2002</p>
            <div className="social-links">
              <a href="#" className="social-link">in</a>
              <a href="#" className="social-link">fb</a>
              <a href="#" className="social-link">tw</a>
              <a href="#" className="social-link">ig</a>
            </div>
          </div>
        </footer>
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

        .logo {
          font-size: 1.5rem;
          font-weight: 600;
          letter-spacing: 1px;
          background: linear-gradient(135deg, var(--color-primary-100), var(--color-primary-200));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* Hero Section */
        .hero {
          padding: 8rem 0 4rem;
          text-align: center;
          position: relative;
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .hero h1 {
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          background: linear-gradient(135deg, #ffffff 0%, var(--color-primary-100) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          line-height: 1.2;
        }

        .hero p {
          font-size: 1.2rem;
          max-width: 600px;
          margin: 0 auto 3rem;
          color: var(--color-light-100);
          opacity: 0.9;
        }

        .hero-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
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

        /* Pricing Section */
        .pricing-section {
          padding: 4rem 0;
          position: relative;
        }

        .pricing-header {
          text-align: center;
          margin-bottom: 5rem;
        }

        .pricing-header h2 {
          font-size: 2.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
          background: linear-gradient(to right, #ffffff, var(--color-primary-100));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .pricing-header p {
          font-size: 1.1rem;
          max-width: 600px;
          margin: 0 auto;
          color: var(--color-light-100);
          opacity: 0.8;
        }

        .pricing-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          perspective: 1000px;
        }

        .pricing-card-wrapper {
          padding: 0.5rem;
          background: linear-gradient(145deg, rgba(75, 77, 79, 0.5), rgba(75, 77, 79, 0.2));
          border-radius: 24px;
          position: relative;
          transition: transform 0.5s ease, box-shadow 0.5s ease;
          transform-style: preserve-3d;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          will-change: transform;
        }

        .pricing-card-wrapper::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 24px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
          backdrop-filter: blur(10px);
          z-index: -1;
        }

        .pricing-card-wrapper:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .pricing-card {
          background: linear-gradient(to bottom, #1A1C20, #08090D);
          border-radius: 20px;
          padding: 3rem 2rem;
          height: 100%;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
        }

        .pricing-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 5px;
          background: linear-gradient(90deg, transparent, var(--color-primary-200), transparent);
          opacity: 0.7;
          transform: scaleX(0.3);
          transition: transform 0.5s ease;
        }

        .pricing-card:hover::before {
          transform: scaleX(1);
        }

        .pricing-card.featured {
          background: linear-gradient(to bottom, #171532, #08090D);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
        }

        .pricing-card.featured::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, var(--color-primary-200), transparent);
          opacity: 0.2;
          border-radius: 0 0 0 100%;
        }

        .plan-name {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #ffffff;
          position: relative;
          display: inline-block;
        }

        .featured .plan-name {
          color: var(--color-primary-100);
        }

        .plan-price {
          font-size: 3rem;
          font-weight: 700;
          margin: 1.5rem 0;
          color: #ffffff;
          position: relative;
        }

        .plan-currency {
          font-size: 1.5rem;
          position: relative;
          top: -15px;
          color: var(--color-primary-100);
        }

        .plan-period {
          font-size: 1rem;
          color: var(--color-light-100);
          opacity: 0.7;
        }

        .plan-description {
          font-size: 0.95rem;
          margin-bottom: 2rem;
          color: var(--color-light-100);
          opacity: 0.8;
          line-height: 1.6;
        }

        .features-list {
          margin: 2rem 0;
          list-style: none;
        }

        .feature-item {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
          color: var(--color-light-100);
          font-size: 0.95rem;
        }

        .feature-icon {
          margin-right: 10px;
          color: var(--color-primary-200);
          font-size: 1.2rem;
        }

        .btn {
          display: inline-block;
          padding: 0.875rem 2rem;
          border-radius: 50px;
          font-weight: 600;
          font-size: 0.95rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          outline: none;
          margin-top: auto;
          position: relative;
          overflow: hidden;
        }

        .btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: all 0.5s;
        }

        .btn:hover::before {
          left: 100%;
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--color-primary-200), var(--color-primary-100));
          color: var(--color-dark-100);
        }

        .btn-primary:hover {
          box-shadow: 0 5px 15px rgba(202, 197, 254, 0.3);
          transform: translateY(-2px);
        }

        .btn-secondary {
          background-color: transparent;
          border: 2px solid var(--color-primary-200);
          color: var(--color-primary-100);
        }

        .btn-secondary:hover {
          background-color: rgba(202, 197, 254, 0.1);
          box-shadow: 0 5px 15px rgba(202, 197, 254, 0.15);
          transform: translateY(-2px);
        }

        .card-badge {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, rgba(202, 197, 254, 0.2), rgba(202, 197, 254, 0.1));
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-primary-100);
          backdrop-filter: blur(5px);
        }

        /* Footer Section */
        footer {
          padding: 3rem 0;
          text-align: center;
          background: linear-gradient(to top, rgba(8, 9, 13, 1), rgba(8, 9, 13, 0));
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
          margin-bottom: 1.5rem;
        }

        .footer-text {
          color: var(--color-light-100);
          opacity: 0.7;
          font-size: 0.9rem;
          margin-bottom: 2rem;
        }

        .social-links {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
          color: var(--color-light-100);
          text-decoration: none;
        }

        .social-link:hover {
          background: rgba(202, 197, 254, 0.2);
          transform: translateY(-3px);
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

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .delay-300 {
          animation-delay: 0.3s;
        }

        .rotate-on-hover {
          transition: transform 0.5s ease;
        }

        .rotate-on-hover:hover {
          transform: rotateY(10deg);
        }

        /* Responsive Styles */
        @media (max-width: 768px) {
          .hero h1 {
            font-size: 2.5rem;
          }

          .hero p {
            font-size: 1rem;
          }

          .pricing-container {
            grid-template-columns: 1fr;
            max-width: 400px;
          }

          .container {
            padding: 1rem;
          }

          .hero {
            padding: 6rem 0 3rem;
          }
        }

        @media (max-width: 480px) {
          .hero h1 {
            font-size: 2rem;
          }

          .pricing-header h2 {
            font-size: 2rem;
          }

          .pricing-card {
            padding: 2rem 1.5rem;
          }

          .plan-price {
            font-size: 2.5rem;
          }
        }
      `}</style>
    </>
  );
}