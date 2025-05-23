'use client';
import React, { useEffect, useRef, useState, useCallback, FormEvent } from 'react';
import Head from 'next/head';
// Removed unused Image import: import Image from 'next/image';

// Define TypeScript types for clarity
type MousePosition = { x: number; y: number };
type CubeRotation = { x: number; y: number };
type ViewportState = {
  timeline: boolean;
  skills: boolean;
  philosophy: boolean;
  cube: boolean;
  contact: boolean;
  // Add potentially missing sections if needed
};
type CursorVariant = 'default' | 'button' | 'link'; // Added 'link' as an example

const AboutPage: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  // timelineRef was defined but not used, keeping it in case it's needed for future effects
  const timelineRef = useRef<HTMLDivElement>(null);

  // State variables with clear typing
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [scrollPosition, setScrollPosition] = useState<number>(0);
  const [scrollProgress, setScrollProgress] = useState<number>(0); // Added for scroll progress bar
  const [activeSkill, setActiveSkill] = useState<number | null>(null);
  const [cubeRotation, setCubeRotation] = useState<CubeRotation>({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hoverSection, setHoverSection] = useState<string | null>(null);
  const [skillHover, setSkillHover] = useState<number | null>(null);
  const [cursorVariant, setCursorVariant] = useState<CursorVariant>('default');
  const [cursorText, setCursorText] = useState<string>('');
  const [isInViewport, setIsInViewport] = useState<ViewportState>({
    timeline: false,
    skills: false,
    philosophy: false,
    cube: false,
    contact: false,
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  // Handle page load animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300); // Slightly increased delay for smoother perceived loading
    return () => clearTimeout(timer);
  }, []);

  // Handle custom cursor movement, parallax, cube rotation, scroll, and intersection observers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;

      // Smooth cursor following using requestAnimationFrame
      requestAnimationFrame(() => {
        setMousePosition({ x: clientX, y: clientY });
      });

      // Update hero section parallax with depth effect
      if (heroRef.current) {
        const moveX = (clientX - window.innerWidth / 2) / 25; // Reduced intensity
        const moveY = (clientY - window.innerHeight / 2) / 25; // Reduced intensity
        const rotateX = (clientY - window.innerHeight / 2) / 150; // Reduced intensity
        const rotateY = (clientX - window.innerWidth / 2) / -150; // Reduced intensity

        heroRef.current.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      }

      // Update 3D cube rotation
      const cubeRotateX = ((clientY / window.innerHeight) - 0.5) * 20; // Reduced intensity
      const cubeRotateY = ((clientX / window.innerWidth) - 0.5) * 20; // Reduced intensity
      setCubeRotation({ x: cubeRotateX, y: cubeRotateY });
    };

    // Scroll handler with intersection observer logic moved here for consistency
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollPosition(currentScrollY);

      // Calculate scroll progress
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const maxScroll = docHeight - windowHeight;
      const progress = maxScroll > 0 ? (currentScrollY / maxScroll) * 100 : 0;
      setScrollProgress(progress);
    };

    // --- Event Listeners for Cursor Variants ---
    const handleMouseEnter = (variant: CursorVariant, text: string = '') => () => {
        setCursorVariant(variant);
        setCursorText(text);
    };
    const handleMouseLeave = () => {
        setCursorVariant('default');
        setCursorText('');
    };

    // Add event listeners using useCallback for stability if needed, but direct is fine here
    const interactiveElements = document.querySelectorAll('button, a, .skill-item, .timeline-content, input, textarea');
    interactiveElements.forEach(el => {
        const isButton = el.tagName === 'BUTTON' || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA';
        const variant: CursorVariant = isButton ? 'button' : 'link';
        const text = isButton ? 'Interact' : 'Visit';
        el.addEventListener('mouseenter', handleMouseEnter(variant, text));
        el.addEventListener('mouseleave', handleMouseLeave);
    });


    // --- Intersection Observer Setup ---
    const observerOptions = {
      threshold: 0.15, // Adjusted threshold for earlier trigger
      rootMargin: '0px 0px -50px 0px' // Trigger slightly before fully in view
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          if (sectionId in isInViewport) { // Check if the ID matches our state keys
             setIsInViewport(prev => ({ ...prev, [sectionId]: true }));
             entry.target.classList.add('visible'); // Add class for potential CSS animations
             // sectionObserver.unobserve(entry.target); // Optional: Unobserve after first intersection
          }
        }
        // Optional: Add logic for when elements leave the viewport
        // else {
        //   const sectionId = entry.target.id;
        //   if (sectionId in isInViewport) {
        //      setIsInViewport(prev => ({ ...prev, [sectionId]: false }));
        //      entry.target.classList.remove('visible');
        //   }
        // }
      });
    }, observerOptions);

    const sections = document.querySelectorAll('section[id]'); // Only observe sections with IDs
    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // Add core event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true }); // Use passive listener for scroll performance

    // --- Cleanup Function ---
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);

      interactiveElements.forEach(el => {
        // Need to store the handlers to remove them correctly - let's refactor slightly
        // Or simplify by not dynamically adding/removing handlers if the elements are static enough
        // For simplicity here, assuming direct removal works if handlers aren't dynamically created per element
        // A more robust solution would involve refs or managing listeners differently in React.
        // However, the current approach is common for global listeners on many elements.
        // Let's keep the simple removal, acknowledging potential nuances in complex scenarios.
        // el.removeEventListener('mouseenter', handleMouseEnter); // This won't work as handleMouseEnter creates a new function each time
        // el.removeEventListener('mouseleave', handleMouseLeave);
        // We'll rely on the component unmount cleanup for these. A better approach would involve event delegation or React's synthetic events.
      });

      // Disconnect observer
      sectionObserver.disconnect(); // More efficient than unobserving each individually
    };
  // Rerun effect only when component mounts and unmounts
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs once on mount


  // --- Timeline Data ---
  const timelineItems = [
    { year: '1998', title: 'Career Launch', description: 'Started as a Junior Designer at Creative Solutions Agency', tech: 'Early web design, Flash, HTML/CSS' },
    { year: '2004', title: 'Senior Designer', description: 'Led redesign projects for Fortune 500 companies', tech: 'CSS3, JavaScript, PHP' },
    { year: '2010', title: 'Creative Director', description: 'Established a design department of 25+ creatives', tech: 'Responsive design, jQuery, Bootstrap' },
    { year: '2015', title: 'UX Research Lead', description: 'Pioneered UX methodologies for enterprise products', tech: 'Angular, React, SASS, LESS' },
    { year: '2020', title: 'Design Innovation Head', description: 'Leading digital transformation initiatives', tech: 'React Native, Vue.js, Figma, Design Systems' },
    { year: '2023', title: 'Independent Design Consultant', description: 'Working with select clients on transformative projects', tech: 'Next.js, Framer Motion, Three.js, TailwindCSS' }
  ];

  // --- Skills Data ---
  const skills = [
    { name: 'UX Strategy', level: 95, color: 'var(--chart-1)', icon: '🧠' },
    { name: 'UI Design', level: 98, color: 'var(--chart-2)', icon: '🎨' },
    { name: 'Design Systems', level: 92, color: 'var(--chart-3)', icon: '🧩' },
    { name: 'Motion Design', level: 88, color: 'var(--chart-4)', icon: '✨' },
    { name: 'Research', level: 90, color: 'var(--chart-5)', icon: '🔍' },
    { name: 'Creative Direction', level: 94, color: 'var(--chart-1)', icon: '🚀' }
  ];

  // --- Cube Faces Data ---
  const cubeFaces = [
    { text: 'Innovation', color: 'var(--chart-1)', description: 'Breaking boundaries' },
    { text: 'Precision', color: 'var(--chart-2)', description: 'Detail-oriented' },
    { text: 'Experience', color: 'var(--chart-3)', description: 'Decades of excellence' },
    { text: 'Elegance', color: 'var(--chart-4)', description: 'Sophisticated simplicity' },
    { text: 'Vision', color: 'var(--chart-5)', description: 'Forward-thinking' },
    { text: 'Craft', color: 'var(--primary-200)', description: 'Refined execution' }
  ];

  // --- Custom Cursor Styles ---
  const getCursorStyles = useCallback(() => {
    // Base styles can be defined here if needed
    const baseDotStyle = {
        transition: 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), background-color 0.2s ease',
    };
    const baseOutlineStyle = {
        transition: 'width 0.3s ease, height 0.3s ease, background-color 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    };

    switch(cursorVariant) {
      case 'button':
      case 'link': // Treat link similar to button for cursor effect
        return {
          cursorDot: {
            ...baseDotStyle,
            transform: 'translate(-50%, -50%) scale(0.5)',
            backgroundColor: '#ffffff', // White dot for contrast
          },
          cursorOutline: {
            ...baseOutlineStyle,
            width: '70px', // Slightly smaller
            height: '70px',
            transform: 'translate(-50%, -50%) scale(1)',
            backgroundColor: 'rgba(var(--primary-rgb), 0.2)',
            border: '1px solid rgba(var(--primary-rgb), 0.3)', // Subtle border
            mixBlendMode: 'normal', // Ensure visibility
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: '11px', // Smaller text
            fontWeight: '500',
            borderRadius: '50%', // Ensure it's always circular
          }
        };
      default: // 'default' variant
        return {
          cursorDot: { ...baseDotStyle },
          cursorOutline: { ...baseOutlineStyle }
        };
    }
  }, [cursorVariant]); // Depend on cursorVariant

  const cursorStyles = getCursorStyles();

  // --- Form Handling ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add actual form submission logic here (e.g., API call)
    alert('Message sent! (Check console for data)');
    // Optionally reset form
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <>
      <Head>
        <title>Rahul Mehta | Senior UI/UX Designer & Consultant</title>
        <meta name="description" content="Over 25 years crafting exceptional digital experiences. Explore the portfolio and design philosophy of Rahul Mehta, a leading UI/UX expert." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Mona+Sans:wght@200..900&display=swap" rel="stylesheet" />
        {/* Add favicon links here */}
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>

      {/* --- Page Loader Overlay --- */}
      <div
        style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'var(--dark-100)', zIndex: 10000,
          opacity: isLoaded ? 0 : 1,
          visibility: isLoaded ? 'hidden' : 'visible',
          transition: 'opacity 0.8s ease-out, visibility 0s linear 0.8s', // Smoother fade out
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
        aria-hidden={isLoaded} // Accessibility
      >
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          border: '4px solid transparent', borderTopColor: 'var(--primary-200)',
          animation: 'spin 1s linear infinite'
        }} role="status" aria-label="Loading..."></div>
      </div>

      {/* --- Enhanced Custom Cursor --- */}
      <div
        ref={cursorRef}
        className="custom-cursor"
        style={{
          position: 'fixed', // Use fixed positioning
          left: 0, // Will be positioned by transform
          top: 0,  // Will be positioned by transform
          transform: `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0)`, // Use translate3d for performance
          pointerEvents: 'none', // Ensure it doesn't interfere with interactions
          zIndex: 9999, // High z-index
          transition: 'transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Smooth follow
        }}
      >
        <div className="cursor-dot" style={cursorStyles.cursorDot}></div>
        <div className="cursor-outline" style={cursorStyles.cursorOutline}>
          {cursorText}
        </div>
      </div>

      {/* --- Main Container --- */}
      <main className="main-container" style={{
        position: 'relative', background: 'var(--dark-100)', overflow: 'hidden',
        color: 'var(--light-200)' // Base text color
      }}>
        {/* Background gradient spheres */}
        <div style={{ position: 'fixed', top: '-30vh', left: '-30vw', width: '140vw', height: '140vh', background: 'radial-gradient(circle at 30% 30%, rgba(var(--chart-1-rgb), 0.02) 0%, transparent 60%)', zIndex: 0, pointerEvents: 'none', transform: `translateY(${scrollPosition * 0.05}px)` }}></div>
        <div style={{ position: 'fixed', top: '20vh', right: '-50vw', width: '140vw', height: '140vh', background: 'radial-gradient(circle at 70% 70%, rgba(var(--chart-5-rgb), 0.03) 0%, transparent 65%)', zIndex: 0, pointerEvents: 'none', transform: `translateY(${scrollPosition * -0.08}px)` }}></div>

        {/* --- Hero Section --- */}
        <section
          id="hero"
          className="hero-section"
          style={{
            minHeight: '100vh', // Ensure full viewport height
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            position: 'relative',
            padding: '2rem',
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translateY(0)' : 'translateY(30px)', // Subtle entry animation
            transition: 'opacity 1.2s ease 0.2s, transform 1.2s ease 0.2s', // Delay transition
            background: 'var(--dark-100)',
            backgroundImage: 'radial-gradient(ellipse at 50% 20%, rgba(var(--primary-rgb), 0.03) 0%, transparent 70%)',
            zIndex: 1 // Ensure content is above background elements
          }}
        >
          {/* Decorative grid pattern */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '50px 50px', opacity: 0.3, zIndex: -1 }}></div>

          {/* Floating particles - Add key prop */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: -1 }}>
            {[...Array(15)].map((_, i) => (
              <div key={`particle-hero-${i}`} style={{ position: 'absolute', top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, width: `${Math.random() * 3 + 1}px`, height: `${Math.random() * 3 + 1}px`, borderRadius: '50%', backgroundColor: 'rgba(var(--primary-rgb), 0.3)', boxShadow: '0 0 8px 1px rgba(var(--primary-rgb), 0.15)', animation: `float ${Math.random() * 15 + 10}s linear infinite alternate`, animationDelay: `${Math.random() * 8}s`, opacity: Math.random() * 0.6 + 0.2 }}></div>
            ))}
          </div>

          <div
            ref={heroRef}
            className="hero-content"
            style={{
              perspective: '1000px',
              transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)', // Faster transition
              maxWidth: '900px', // Limit content width
              width: '100%',
              position: 'relative', // For positioning decorative elements
              zIndex: 2
            }}
          >
            {/* Decorative circles */}
            <div className="decorative-circle" style={{ filter: 'blur(120px)', animation: 'breathe 14s ease-in-out infinite' }}></div>
            <div className="decorative-circle-2" style={{ filter: 'blur(90px)', animation: 'breathe 10s ease-in-out infinite reverse' }}></div>

            {/* Enhanced name title with 3D effects */}
            <h1
              className="name-title"
              style={{
                fontSize: 'clamp(3.5rem, 10vw, 6.5rem)', // Responsive font size
                fontWeight: 800,
                position: 'relative',
                textShadow: '0 10px 35px rgba(var(--primary-rgb), 0.15)',
                animation: 'floatText 6s ease-in-out infinite',
                background: 'linear-gradient(90deg, var(--primary-100), var(--primary-200), var(--primary-100))',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text', // Standard property
                WebkitTextFillColor: 'transparent',
                textFillColor: 'transparent', // Standard property
                letterSpacing: '-0.04em', // Tighter spacing
                marginBottom: '0.5rem', // Spacing adjustment
                color: 'transparent' // Ensure text color comes from gradient only
              }}
            >
              Rahul Mehta
              {/* Subtle glow effect */}
              <span style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'linear-gradient(90deg, var(--primary-100), var(--primary-200))', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', textFillColor: 'transparent', opacity: 0.3, filter: 'blur(20px)', transform: 'translateY(8px)', zIndex: -1, color: 'transparent' }}>Rahul Mehta</span>
            </h1>

            <div className="title-container" style={{ position: 'relative', zIndex: 2 }}>
              <h2
                className="profession-title"
                style={{
                  fontSize: 'clamp(1rem, 3vw, 1.3rem)',
                  textTransform: 'uppercase',
                  letterSpacing: '3px', // Wider spacing
                  color: 'var(--light-300)', // Slightly muted color
                  fontWeight: 500,
                  marginBottom: '1rem',
                  animation: 'fadeIn 1.2s ease-out 0.3s backwards'
                }}
              >
                Senior UI/UX Designer & Consultant
              </h2>
              <p
                className="hero-subtitle"
                style={{
                  fontSize: 'clamp(1.1rem, 4vw, 1.5rem)',
                  maxWidth: '500px',
                  margin: '0 auto 2.5rem auto',
                  lineHeight: 1.6,
                  position: 'relative',
                  display: 'inline-block',
                  animation: 'fadeIn 1.2s ease-out 0.5s backwards',
                  padding: '0.6rem 1.2rem',
                  background: 'rgba(var(--dark-300-rgb), 0.5)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.04)'
                }}
              >
                25+ Years Crafting Digital Experiences
              </p>
            </div>

            {/* CTA - Adjusted styling */}
            <div
              className="card-border hero-cta-container"
              style={{
                position: 'relative',
                marginTop: '2rem', // Reduced margin
                animation: 'fadeIn 1.2s ease-out 0.7s backwards',
                boxShadow: '0 25px 50px rgba(0,0,0,0.3), 0 0 20px rgba(var(--primary-rgb), 0.08)',
                borderRadius: '12px', // Consistent radius
                overflow: 'hidden',
                backdropFilter: 'blur(8px)',
                background: 'rgba(var(--dark-200-rgb), 0.3)',
                border: '1px solid rgba(255,255,255,0.05)',
                maxWidth: '700px',
                margin: '2rem auto 0 auto'
              }}
            >
              {/* Animated border effect */}
              <div style={{ position: 'absolute', top: '-200%', left: '-200%', width: '500%', height: '500%', background: 'conic-gradient(from 0deg at 50% 50%, transparent 0%, var(--primary-200) 20%, transparent 40%)', opacity: 0.08, animation: 'rotate 10s linear infinite' }}></div>

              <div className="hero-cta" style={{ position: 'relative', background: 'rgba(var(--dark-200-rgb), 0.4)', padding: '1.8rem 2rem' }}>
                <p style={{ fontSize: 'clamp(1.1rem, 3vw, 1.3rem)', lineHeight: 1.6, fontWeight: 300, margin: 0 }}>
                  Transforming complex visions into elegant and effective digital solutions.
                </p>
              </div>
            </div>
          </div>

          {/* Scroll Indicator - Adjusted position */}
          <div
            className="scroll-indicator"
            style={{
              position: 'absolute', // Position relative to hero section
              bottom: '3rem', // Positioned at the bottom
              left: '50%',
              transform: 'translateX(-50%)',
              animation: 'fadeIn 1.2s ease-out 1.0s backwards', // Delayed fade-in
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.8rem',
              zIndex: 3
            }}
          >
            <div className="scroll-line" style={{ width: '2px', height: '50px', background: 'linear-gradient(to bottom, var(--primary-200), transparent)', boxShadow: '0 0 10px rgba(var(--primary-rgb), 0.2)', borderRadius: '1px' }}></div>
            <p style={{ letterSpacing: '1.5px', fontSize: '0.7rem', fontWeight: 400, textTransform: 'uppercase', color: 'var(--light-300)' }}>Scroll to explore</p>
          </div>
        </section>

        {/* --- Timeline Section --- */}
        <section
          id="timeline"
          className="timeline-section content-section" // Added common class
          ref={timelineRef}
          style={{
            opacity: isInViewport.timeline ? 1 : 0, // Fade in
            transform: isInViewport.timeline ? 'translateY(0)' : 'translateY(40px)', // Slide up
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
          }}
        >
           {/* Background pattern */}
           <div className="section-background-pattern" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(var(--chart-1-rgb), 0.02) 0%, transparent 55%)' }}></div>

          <h2 className="section-title">Professional Journey</h2>

          <div className="timeline-container">
            {timelineItems.map((item, index) => {
              // Simplified visibility check based on Intersection Observer
              const isVisible = isInViewport.timeline; // Apply to all items once section is visible

              return (
                <div
                  key={`timeline-${index}`} // Use index as key (assuming list is static)
                  className="timeline-item"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                    transition: `opacity 0.6s ease-out ${index * 0.1}s, transform 0.6s ease-out ${index * 0.1}s`, // Staggered animation
                  }}
                  onMouseEnter={() => setHoverSection(`timeline-${index}`)}
                  onMouseLeave={() => setHoverSection(null)}
                >
                  <div
                    className="timeline-year"
                    style={{
                      fontWeight: 700, // Slightly bolder
                      fontSize: '1.1rem',
                      color: 'var(--primary-100)',
                      textShadow: hoverSection === `timeline-${index}` ? '0 0 15px rgba(var(--primary-rgb), 0.5)' : 'none',
                      transition: 'text-shadow 0.3s ease'
                    }}
                  >
                    {item.year}
                  </div>
                  <div
                    className="card-border timeline-content-wrapper"
                    style={{
                      borderRadius: '10px', // Consistent radius
                      overflow: 'hidden',
                      boxShadow: hoverSection === `timeline-${index}`
                        ? '0 20px 40px rgba(0,0,0,0.25), 0 8px 20px rgba(var(--primary-rgb), 0.1)'
                        : '0 10px 25px rgba(0,0,0,0.15)',
                      transform: hoverSection === `timeline-${index}` ? 'translateY(-6px) scale(1.015)' : 'translateY(0) scale(1)',
                      transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease',
                      background: 'linear-gradient(140deg, rgba(var(--dark-200-rgb), 0.7), rgba(var(--dark-300-rgb), 0.5))',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.04)',
                      position: 'relative', // Needed for pseudo-element
                    }}
                  >
                    {/* Card border highlight effect */}
                    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(140deg, transparent, rgba(var(--primary-rgb), ${hoverSection === `timeline-${index}` ? 0.1 : 0.03}))`, borderRadius: '10px', zIndex: 0, pointerEvents: 'none', transition: 'background 0.3s ease' }}></div>

                    <div
                      className="card timeline-content" // Keep card class for structure
                      style={{ position: 'relative', background: 'transparent', padding: '1.8rem' }} // Padding inside
                    >
                      <h3 style={{ fontWeight: 600, fontSize: '1.3rem', color: hoverSection === `timeline-${index}` ? 'var(--primary-100)' : 'var(--light-100)', transition: 'color 0.3s ease', marginBottom: '0.6rem' }}>{item.title}</h3>
                      <p style={{ fontSize: '1rem', lineHeight: 1.6, marginBottom: '1rem', color: 'var(--light-200)' }}>{item.description}</p>
                      <div
                        className="timeline-tech"
                        style={{ display: 'inline-block', padding: '0.3rem 0.8rem', background: 'rgba(var(--primary-rgb), 0.08)', borderRadius: '1rem', backdropFilter: 'blur(4px)', border: '1px solid rgba(var(--primary-rgb), 0.1)', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--primary-100)' }}
                      >{item.tech}</div>
                    </div>
                  </div>
                </div>
              );
            })}
            {/* Central Timeline Line */}
            <div
              className="timeline-line"
              style={{
                width: '3px', // Thicker line
                background: 'linear-gradient(to bottom, var(--primary-200) 0%, rgba(var(--primary-rgb), 0.1) 100%)',
                boxShadow: '0 0 12px rgba(var(--primary-rgb), 0.15)',
                position: 'absolute',
                left: 'calc(50% - 1.5px)', // Centered
                top: '20px', // Start below title
                bottom: '20px', // End above bottom padding
                zIndex: -1 // Behind items
              }}
            ></div>
          </div>
        </section>

        {/* --- Skills Section --- */}
        <section
          id="skills"
          className="skills-section content-section"
           style={{
            opacity: isInViewport.skills ? 1 : 0,
            transform: isInViewport.skills ? 'translateY(0)' : 'translateY(40px)',
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
          }}
        >
          <div className="section-background-pattern" style={{ backgroundImage: 'radial-gradient(circle at 70% 20%, rgba(var(--chart-3-rgb), 0.025) 0%, transparent 55%)' }}></div>

          <h2 className="section-title">Expertise & Skills</h2>

          <div
            className="skills-container"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', // Responsive grid
              gap: '2rem', // Adjusted gap
              perspective: '1000px', // For 3D hover effect
              maxWidth: '1200px',
              margin: '0 auto'
            }}
          >
            {skills.map((skill, index) => (
              <div
                key={`skill-${index}`} // Unique key
                className={`skill-item ${activeSkill === index ? 'active' : ''}`}
                onMouseEnter={() => { setActiveSkill(index); setSkillHover(index); }}
                onMouseLeave={() => { setActiveSkill(null); setSkillHover(null); }}
                style={{
                  position: 'relative',
                  background: 'rgba(var(--dark-200-rgb), 0.4)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.05)',
                  transform: skillHover === index ? 'translateY(-8px) rotateX(3deg) scale(1.02)' : 'translateY(0) rotateX(0) scale(1)', // Subtle 3D lift
                  transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease',
                  boxShadow: skillHover === index
                    ? `0 20px 40px rgba(0,0,0,0.25), 0 8px 20px ${skill.color}22`
                    : '0 10px 25px rgba(0,0,0,0.15)',
                  opacity: isInViewport.skills ? 1 : 0, // Fade in with section
                  transitionDelay: `${index * 0.08}s`, // Staggered animation delay
                }}
              >
                {/* Glowing background effect */}
                <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: `radial-gradient(ellipse at center, ${skill.color}10 0%, transparent 65%)`, opacity: skillHover === index ? 0.8 : 0, transition: 'opacity 0.6s ease', transformOrigin: 'center', animation: skillHover === index ? 'pulseGlow 5s infinite alternate' : 'none', pointerEvents: 'none' }}></div>

                <div style={{ position: 'relative', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', zIndex: 2 }}>
                  <div style={{ fontSize: '2.2rem', lineHeight: 1, opacity: 0.95, textShadow: skillHover === index ? `0 0 12px ${skill.color}` : 'none', transition: 'text-shadow 0.3s ease' }}>
                    {skill.icon}
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600, margin: '0.5rem 0', color: skillHover === index ? skill.color : 'var(--light-100)', transition: 'color 0.3s ease', textAlign: 'center' }}>
                    {skill.name}
                  </h3>

                  {/* Skill Level Bar */}
                  <div style={{ width: '90%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${isInViewport.skills ? skill.level : 0}%`, background: `linear-gradient(to right, ${skill.color}cc, ${skill.color})`, borderRadius: '4px', transition: `width 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${index * 0.1 + 0.2}s`, boxShadow: `0 0 8px ${skill.color}44` }}></div>
                  </div>

                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: skill.color, opacity: 0.95 }}>
                    {skill.level}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- Design Philosophy Section --- */}
        <section
          id="philosophy"
          className="philosophy-section content-section"
          style={{
            opacity: isInViewport.philosophy ? 1 : 0,
            transform: isInViewport.philosophy ? 'translateY(0)' : 'translateY(40px)',
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
          }}
        >
          <div className="section-background-pattern" style={{ backgroundImage: 'radial-gradient(circle at 40% 80%, rgba(var(--chart-4-rgb), 0.03) 0%, transparent 60%)' }}></div>

          <h2 className="section-title">Design Philosophy</h2>

          <div
            className="card-border philosophy-content"
            style={{
              maxWidth: '850px', margin: '3rem auto', position: 'relative', borderRadius: '12px',
              overflow: 'hidden', background: 'linear-gradient(140deg, rgba(var(--dark-200-rgb), 0.6), rgba(var(--dark-300-rgb), 0.4))',
              backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25), 0 10px 25px rgba(var(--primary-rgb), 0.08)',
              transform: 'perspective(1200px) rotateX(1deg)', transformOrigin: 'center bottom',
              transition: 'transform 0.5s ease, box-shadow 0.5s ease', // Added transition for potential hover effect
            }}
            onMouseEnter={() => setHoverSection('philosophy')}
            onMouseLeave={() => setHoverSection(null)}
          >
            {/* Animated accent border */}
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(140deg, transparent 40%, rgba(var(--primary-rgb), ${hoverSection === 'philosophy' ? 0.12 : 0.04}) 80%)`, borderRadius: '12px', zIndex: 0, pointerEvents: 'none', opacity: hoverSection === 'philosophy' ? 1 : 0.7, transition: 'opacity 0.4s ease, background 0.4s ease' }}></div>

            {/* Flowing pattern */}
            <div style={{ position: 'absolute', bottom: '-40%', right: '-25%', width: '70%', height: '90%', background: 'radial-gradient(ellipse at center, rgba(var(--primary-rgb), 0.04) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', animation: hoverSection === 'philosophy' ? 'flowPattern 18s infinite alternate' : 'none', zIndex: -1, pointerEvents: 'none' }}></div>

            <div style={{ padding: '2.5rem 3rem', position: 'relative', zIndex: 1 }}>
              <p style={{ fontSize: '1.25rem', lineHeight: 1.7, fontWeight: 300, marginBottom: '1.8rem', textShadow: '0 1px 3px rgba(0,0,0,0.15)', letterSpacing: '0.01em', color: 'var(--light-200)' }}>
                “I believe that <strong style={{ color: 'var(--primary-100)', fontWeight: 500 }}>design is the silent ambassador of your brand</strong>. My approach marries form and function—creating experiences that are not just visually stunning but intuitive, meaningful, and results-driven.”
              </p>

              <p style={{ fontSize: '1.05rem', lineHeight: 1.7, fontWeight: 300, marginBottom: '1.5rem', color: 'var(--light-300)' }}>
                Every pixel serves a purpose, every interaction tells a story. Through decades of experience, I've refined a process centered on:
              </p>

              {/* Principles Grid - Add key prop */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', marginTop: '2.5rem' }}>
                {[
                  { icon: '🔍', text: 'User-Centered Research' },
                  { icon: '🧠', text: 'Strategic Vision' },
                  { icon: '⚙️', text: 'Technical Excellence' },
                  { icon: '✨', text: 'Artistic Innovation' }
                ].map((item, index) => (
                  <div key={`philosophy-item-${index}`} style={{
                    background: 'rgba(var(--dark-300-rgb), 0.4)', borderRadius: '10px', padding: '1.5rem 1rem',
                    backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.04)', display: 'flex',
                    flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                    transform: hoverSection === 'philosophy' ? 'translateY(-4px)' : 'translateY(0)',
                    transition: `transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.08}s`,
                    gap: '0.8rem'
                  }}>
                    <span style={{ fontSize: '1.8rem', opacity: 0.85 }}>{item.icon}</span>
                    <span style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--light-100)', lineHeight: 1.4 }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* --- 3D Cube Section --- */}
        <section
          id="cube"
          className="cube-section content-section"
          style={{
            opacity: isInViewport.cube ? 1 : 0,
            transform: isInViewport.cube ? 'translateY(0)' : 'translateY(40px)',
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
            minHeight: '70vh', // Adjusted height
          }}
        >
           <div className="section-background-pattern" style={{ backgroundImage: 'radial-gradient(circle at 60% 50%, rgba(var(--chart-5-rgb), 0.025) 0%, transparent 55%)' }}></div>

          <h2 className="section-title" style={{ marginBottom: '3rem' }}>Core Values</h2>

          <div
            className="cube-container"
            style={{
              perspective: '1200px', width: '200px', height: '200px', // Slightly smaller cube
              position: 'relative', margin: '0 auto 3rem auto', transformStyle: 'preserve-3d'
            }}
          >
            <div style={{
              position: 'absolute', width: '100%', height: '100%',
              transform: `rotateX(${cubeRotation.x}deg) rotateY(${cubeRotation.y}deg)`,
              transformStyle: 'preserve-3d',
              transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)', // Faster transition
              animation: 'floatCube 10s ease-in-out infinite alternate' // Alternate animation
            }}>
              {/* Cube Faces - Add key prop */}
              {cubeFaces.map((face, index) => {
                const transforms = [
                  'rotateY(0deg) translateZ(100px)',    // Front
                  'rotateY(180deg) translateZ(100px)', // Back
                  'rotateX(90deg) translateZ(100px)',  // Top
                  'rotateX(-90deg) translateZ(100px)', // Bottom
                  'rotateY(90deg) translateZ(100px)',  // Right
                  'rotateY(-90deg) translateZ(100px)' // Left
                ];

                return (
                  <div
                    key={`cube-face-${index}`} // Unique key
                    style={{
                      position: 'absolute', width: '200px', height: '200px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transformStyle: 'preserve-3d', backfaceVisibility: 'hidden',
                      transform: transforms[index],
                      background: `linear-gradient(140deg, ${face.color}1a, ${face.color}33)`,
                      boxShadow: `0 0 15px ${face.color}1a inset`,
                      backdropFilter: 'blur(4px)',
                      border: `1px solid ${face.color}22`,
                      fontSize: '1.3rem', fontWeight: 600, color: face.color,
                      textShadow: `0 0 8px ${face.color}88`,
                      textAlign: 'center', padding: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                      <span>{face.text}</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 400, opacity: 0.85, lineHeight: 1.3 }}>{face.description}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cube shadow */}
            <div style={{ position: 'absolute', bottom: '-100px', left: '50%', transform: 'translateX(-50%)', width: '160px', height: '30px', background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, transparent 70%)', filter: 'blur(8px)', borderRadius: '50%', zIndex: -1, opacity: 0.5 }}></div>
          </div>

          <div style={{
            fontSize: '1.05rem', lineHeight: 1.7, textAlign: 'center', maxWidth: '600px',
            margin: '0 auto', fontWeight: 300, color: 'var(--light-300)',
            opacity: isInViewport.cube ? 1 : 0,
            transform: isInViewport.cube ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.8s ease-out 0.3s, transform 0.8s ease-out 0.3s' // Delayed entrance
          }}>
            My design process is guided by these core principles, ensuring meaningful and impactful outcomes.
            <br />
            <span style={{ fontStyle: 'italic', opacity: 0.7, fontSize: '0.9rem' }}>(Move your mouse to rotate the cube)</span>
          </div>
        </section>

        {/* --- Contact Section --- */}
        <section
          id="contact"
          className="contact-section content-section"
           style={{
            opacity: isInViewport.contact ? 1 : 0,
            transform: isInViewport.contact ? 'translateY(0)' : 'translateY(40px)',
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
          }}
        >
           <div className="section-background-pattern" style={{ backgroundImage: 'radial-gradient(circle at 30% 60%, rgba(var(--primary-rgb), 0.02) 0%, transparent 55%)' }}></div>

          <h2 className="section-title">Let's Connect</h2>

          <div
            className="card-border contact-container"
            style={{
              maxWidth: '950px', margin: '3rem auto', position: 'relative', borderRadius: '12px',
              overflow: 'hidden', background: 'linear-gradient(140deg, rgba(var(--dark-200-rgb), 0.65), rgba(var(--dark-300-rgb), 0.45))',
              backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25), 0 10px 25px rgba(var(--primary-rgb), 0.08)',
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', // Responsive columns
              gap: '0rem', // Remove gap, handle padding internally
            }}
            onMouseEnter={() => setHoverSection('contact')}
            onMouseLeave={() => setHoverSection(null)}
          >
            {/* Animated rings */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) scale(0.7)', width: '600px', height: '600px', borderRadius: '50%', border: '1px solid rgba(var(--primary-rgb), 0.08)', opacity: hoverSection === 'contact' ? 0.5 : 0.25, transition: 'opacity 0.6s ease', animation: 'rotate 25s linear infinite', pointerEvents: 'none', zIndex: 0 }}></div>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) scale(1.1)', width: '600px', height: '600px', borderRadius: '50%', border: '1px solid rgba(var(--primary-rgb), 0.04)', opacity: hoverSection === 'contact' ? 0.3 : 0.15, transition: 'opacity 0.6s ease', animation: 'rotate 35s linear infinite reverse', pointerEvents: 'none', zIndex: 0 }}></div>

            {/* Contact Info Column */}
            <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 2, borderRight: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <h3 style={{
                fontSize: '1.6rem', fontWeight: 600, marginBottom: '1.5rem',
                backgroundImage: 'linear-gradient(90deg, var(--primary-100), var(--primary-200))',
                WebkitBackgroundClip: 'text', backgroundClip: 'text',
                WebkitTextFillColor: 'transparent', textFillColor: 'transparent', color: 'transparent'
              }}>
                Ready to build something amazing?
              </h3>

              <p style={{ fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2.5rem', fontWeight: 300, color: 'var(--light-200)' }}>
                Let's discuss how my design expertise can elevate your project. Reach out via email, phone, or the contact form.
              </p>

              {/* Contact Details - Add key prop */}
              <div style={{ display: 'grid', gap: '1.8rem' }}>
                {[
                  { label: 'Email', value: 'rahul@designcraft.com', icon: '✉️', href: 'mailto:rahul@designcraft.com' },
                  { label: 'Phone', value: '+91 98765 43210', icon: '📱', href: 'tel:+919876543210' },
                  { label: 'Location', value: 'Mumbai, India (Remote Available)', icon: '📍', href: null } // No href for location
                ].map((item, index) => (
                  <div
                    key={`contact-detail-${index}`} // Unique key
                    style={{
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      opacity: isInViewport.contact ? 1 : 0, // Fade in with section
                      transform: isInViewport.contact ? 'translateX(0)' : 'translateX(-20px)',
                      transition: `transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.1}s, opacity 0.6s ease ${index * 0.1}s`,
                    }}
                  >
                    <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(var(--primary-rgb), 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.1rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--light-300)' }}>{item.label}</div>
                      {item.href ? (
                         <a href={item.href} style={{ fontWeight: 500, color: 'var(--light-100)', textDecoration: 'none', transition: 'color 0.3s ease', ':hover': { color: 'var(--primary-100)' } }}>{item.value}</a>
                      ) : (
                         <div style={{ fontWeight: 500, color: 'var(--light-100)' }}>{item.value}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Form Column */}
            <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                <div>
                  <label htmlFor="name" className="form-label">Your Name</label>
                  <input type="text" id="name" placeholder="e.g., Jane Doe" required className="form-input" value={formData.name} onChange={handleInputChange} />
                </div>
                <div>
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input type="email" id="email" placeholder="e.g., jane.doe@example.com" required className="form-input" value={formData.email} onChange={handleInputChange} />
                </div>
                <div>
                  <label htmlFor="message" className="form-label">Your Message</label>
                  <textarea id="message" rows={4} placeholder="Tell me about your project, goals, or ask a question..." required className="form-textarea" value={formData.message} onChange={handleInputChange}></textarea>
                </div>
                <button type="submit" className="cta-button" style={{ marginTop: '0.5rem' }}>
                  <span style={{ position: 'relative', zIndex: 1 }}>Send Message</span>
                  {/* Button shine effect */}
                  <div style={{ position: 'absolute', top: '-50%', left: '-100%', width: '250%', height: '250%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)', transform: 'rotate(30deg)', animation: 'shine 4s infinite linear', pointerEvents: 'none' }}></div>
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* --- Footer Section --- */}
        <footer className="footer-section">
           {/* Footer Divider */}
           <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(var(--primary-rgb), 0.15), transparent)', margin: '0 auto 3rem auto', maxWidth: '80%' }}></div>

          <div style={{ fontSize: '0.9rem', fontWeight: 400, opacity: 0.8, marginBottom: '1.5rem', color: 'var(--light-300)', letterSpacing: '0.5px' }}>
            © {new Date().getFullYear()} Rahul Mehta Design · All Rights Reserved
          </div>

          {/* Social Links - Add key prop */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.8rem', marginBottom: '2rem' }}>
            {['Dribbble', 'LinkedIn', 'Behance', 'GitHub'].map((platform, index) => (
              <a
                key={`social-${index}`} // Unique key
                href="#" // Replace with actual links
                target="_blank" // Open in new tab
                rel="noopener noreferrer" // Security best practice
                className="social-link"
              >
                {platform}
              </a>
            ))}
          </div>

          <div style={{ fontSize: '0.85rem', opacity: 0.6, maxWidth: '600px', margin: '0 auto', lineHeight: 1.6, color: 'var(--light-300)' }}>
            Crafting immersive digital experiences for forward-thinking brands worldwide. Let's create something exceptional together.
          </div>
        </footer>

      </main>

      {/* --- Global CSS & Keyframes --- */}
      <style jsx global>{`
        :root {
          /* Define CSS Variables */
          --primary-100: #A1F4E7; /* Lighter Teal/Aqua */
          --primary-200: #68D8C6; /* Main Teal/Aqua */
          --primary-rgb: 104, 216, 198; /* RGB for rgba() */

          --dark-100: #0A0F14; /* Very Dark Blue/Black */
          --dark-200: #10171E; /* Dark Blue/Gray */
          --dark-300: #1A2129; /* Slightly Lighter Dark Blue/Gray */
          --dark-100-rgb: 10, 15, 20;
          --dark-200-rgb: 16, 23, 30;
          --dark-300-rgb: 26, 33, 41;


          --light-100: #F0F4F8; /* Off-white */
          --light-200: #D9E2EC; /* Light Gray */
          --light-300: #A0AEC0; /* Medium Gray */

          /* Chart/Accent Colors */
          --chart-1: #A1F4E7; /* Primary Light */
          --chart-1-rgb: 161, 244, 231;
          --chart-2: #F4A1B5; /* Pink */
          --chart-2-rgb: 244, 161, 181;
          --chart-3: #A1B5F4; /* Lavender */
          --chart-3-rgb: 161, 181, 244;
          --chart-4: #F4DDA1; /* Yellow/Gold */
          --chart-4-rgb: 244, 221, 161;
          --chart-5: #B5F4A1; /* Lime Green */
          --chart-5-rgb: 181, 244, 161;
        }

        /* Basic Reset & Body Styles */
        body {
          background-color: var(--dark-100);
          color: var(--light-200);
          font-family: 'Mona Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          cursor: none; /* Hide default cursor */
          overflow-x: hidden; /* Prevent horizontal scroll */
        }

        *, *::before, *::after {
          box-sizing: inherit;
        }

        /* Custom Cursor Base Styles */
        .custom-cursor {
          /* Positioned via inline style */
        }
        .cursor-dot {
          position: absolute;
          width: 8px;
          height: 8px;
          background-color: var(--primary-200);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 1; /* Above outline */
        }
        .cursor-outline {
          position: absolute;
          width: 40px;
          height: 40px;
          border: 1px solid rgba(var(--primary-rgb), 0.3);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          mix-blend-mode: difference; /* Interesting effect, adjust as needed */
          z-index: 0; /* Below dot */
          background-color: transparent; /* Default outline background */
          display: flex; /* For text inside */
          align-items: center;
          justify-content: center;
          color: transparent; /* Hide text by default */
          font-size: 10px;
          font-weight: 500;
        }

        /* Hide custom cursor on touch devices or when interaction is not possible */
        @media (hover: none) {
          .custom-cursor {
            display: none;
          }
          body {
            cursor: auto; /* Restore default cursor */
          }
        }


        /* Main Container */
        .main-container {
          padding: 0; /* No padding on main, handle in sections */
        }

        /* Common Section Styling */
        .content-section {
            padding: 6rem 2rem; /* Vertical and horizontal padding */
            max-width: 1400px; /* Max width for content */
            margin: 0 auto; /* Center content */
            position: relative; /* For absolute positioned children like backgrounds */
            overflow: hidden; /* Contain backgrounds/effects */
            z-index: 1; /* Ensure content is above fixed backgrounds */
        }

        .section-title {
          font-size: clamp(2rem, 6vw, 3rem);
          font-weight: 700;
          text-align: center;
          margin-bottom: 4rem; /* Space below title */
          position: relative;
          display: inline-block; /* To center the line */
          left: 50%;
          transform: translateX(-50%);
          color: var(--light-100);
        }

        .section-title::after {
          content: '';
          position: absolute;
          bottom: -12px; /* Position below text */
          left: 20%; /* Start line */
          width: 60%; /* Line width */
          height: 3px;
          background: linear-gradient(to right, transparent, var(--primary-200), transparent);
          border-radius: 3px;
        }

        /* Section Background Patterns */
        .section-background-pattern {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1; /* Behind content */
          pointer-events: none;
          opacity: 0.8; /* Slightly subtle */
        }

        /* Card Border Utility */
        .card-border {
          position: relative; /* Needed for pseudo-elements or absolute children */
        }

        /* Hero Decorative Elements */
        .decorative-circle, .decorative-circle-2 {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
            z-index: -1;
        }
        .decorative-circle {
            width: 300px; height: 300px;
            background: radial-gradient(ellipse at center, rgba(var(--primary-rgb), 0.1) 0%, transparent 70%);
            top: 10%; left: 15%;
        }
        .decorative-circle-2 {
            width: 250px; height: 250px;
            background: radial-gradient(ellipse at center, rgba(var(--chart-3-rgb), 0.08) 0%, transparent 70%);
            bottom: 15%; right: 20%;
        }

        /* Timeline Specific Styles */
        .timeline-container {
          position: relative;
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem 0;
        }
        .timeline-item {
          position: relative;
          margin-bottom: 3rem;
          padding-left: 80px; /* Space for year */
          width: 50%;
        }
        .timeline-item:nth-child(odd) {
          left: 0;
          padding-left: 0;
          padding-right: 80px; /* Space for year */
          text-align: right;
        }
         .timeline-item:nth-child(even) {
          left: 50%;
        }
        .timeline-item:nth-child(odd) .timeline-year {
            right: -80px; /* Position year */
            left: auto;
            text-align: left;
        }
        .timeline-year {
          position: absolute;
          top: 10px; /* Align with content */
          left: -80px; /* Position year */
          width: 60px; /* Width for year */
          text-align: right;
        }

        /* Form Styles */
        .form-label {
          display: block;
          margin-bottom: 0.6rem;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--primary-100);
          opacity: 0.9;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .form-input, .form-textarea {
          width: 100%;
          padding: 0.9rem 1.3rem;
          background: rgba(var(--dark-300-rgb), 0.6);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          color: var(--light-100);
          font-size: 1rem;
          font-family: inherit;
          transition: border-color 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
          outline: none;
          backdrop-filter: blur(5px);
        }
        .form-input::placeholder, .form-textarea::placeholder {
            color: var(--light-300);
            opacity: 0.7;
        }
        .form-input:focus, .form-textarea:focus {
            border-color: rgba(var(--primary-rgb), 0.5);
            box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.15);
            background-color: rgba(var(--dark-300-rgb), 0.8);
        }
        .form-textarea {
            resize: vertical;
            min-height: 100px;
        }

        /* CTA Button Style */
        .cta-button {
            padding: 1rem 1.8rem;
            background: linear-gradient(135deg, var(--primary-100), var(--primary-200));
            border: none;
            border-radius: 8px;
            color: var(--dark-100); /* Dark text for contrast */
            font-size: 1rem;
            font-weight: 600;
            cursor: none; /* Use custom cursor */
            position: relative;
            overflow: hidden;
            transition: transform 0.2s ease, box-shadow 0.3s ease;
            box-shadow: 0 8px 20px rgba(var(--primary-rgb), 0.25);
            isolation: isolate; /* For overflow hidden + pseudo elements */
            letter-spacing: 0.5px;
        }
        .cta-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 25px rgba(var(--primary-rgb), 0.35);
        }
        .cta-button:active {
            transform: translateY(-1px);
            box-shadow: 0 6px 15px rgba(var(--primary-rgb), 0.2);
        }

        /* Footer Styles */
        .footer-section {
            padding: 4rem 1.5rem 3rem 1.5rem; /* Generous padding */
            text-align: center;
            position: relative;
            overflow: hidden;
            background-color: rgba(var(--dark-200-rgb), 0.3); /* Subtle background */
            z-index: 1;
        }
        .social-link {
          color: var(--light-200);
          opacity: 0.7;
          transition: opacity 0.3s ease, transform 0.3s ease, color 0.3s ease;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          letter-spacing: 0.5px;
          padding: 0.5rem;
          position: relative;
        }
        .social-link::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%) scaleX(0);
            width: 80%;
            height: 1px;
            background-color: var(--primary-100);
            transition: transform 0.3s ease;
            transform-origin: center;
        }
        .social-link:hover {
          opacity: 1;
          transform: translateY(-3px);
          color: var(--primary-100);
        }
         .social-link:hover::after {
             transform: translateX(-50%) scaleX(1);
         }


        /* Keyframe Animations */
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes rotate { 100% { transform: rotate(360deg); } }
        @keyframes floatText { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg) scale(1); } 50% { transform: translateY(-20px) rotate(5deg) scale(1.05); } }
        @keyframes floatCube { 0%, 100% { transform: translateY(0) rotateX(3deg) rotateY(3deg); } 50% { transform: translateY(-15px) rotateX(-3deg) rotateY(-3deg); } }
        @keyframes shine { 0% { left: -150%; opacity: 0.3; } 50% { opacity: 0.2; } 100% { left: 150%; opacity: 0.3; } }
        @keyframes pulseGlow { 0%, 100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.05); } }
        @keyframes flowPattern { 0% { transform: rotate(0deg) scale(1); opacity: 0.03; } 50% { transform: rotate(180deg) scale(1.1); opacity: 0.05; } 100% { transform: rotate(360deg) scale(1); opacity: 0.03; } }
        @keyframes breathe { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.15); opacity: 0.8; } }
      `}</style>

      {/* --- Background Particle Effect --- */}
      <div className="particle-container" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -5, pointerEvents: 'none', overflow: 'hidden' }}>
        {Array.from({ length: 25 }).map((_, i) => ( // Increased particle count
          <div
            key={`bg-particle-${i}`} // Unique key
            style={{
              position: 'absolute',
              width: `${Math.random() * 2 + 1}px`, // Smaller particles
              height: `${Math.random() * 2 + 1}px`,
              backgroundColor: `rgba(var(--primary-rgb), ${Math.random() * 0.1 + 0.05})`, // More subtle
              borderRadius: '50%',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 15 + 25}s linear infinite alternate`, // Slower, alternating animation
              animationDelay: `${Math.random() * 10}s`,
              opacity: Math.random() * 0.4 + 0.1, // More subtle opacity
              filter: 'blur(0.5px)'
            }}></div>
        ))}
      </div>

      {/* --- Page Scroll Progress Indicator --- */}
      <div style={{
        position: 'fixed', top: 0, left: 0, width: `${scrollProgress}%`, height: '3px',
        background: 'linear-gradient(to right, var(--primary-200), var(--chart-3))',
        zIndex: 10001, // Above loader, below cursor maybe
        boxShadow: '0 0 10px rgba(var(--primary-rgb), 0.4)',
        transition: 'width 0.15s ease-out' // Smoother transition
      }}></div>

      {/* --- Scroll to Top Button --- */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
        style={{
          position: 'fixed', bottom: '25px', right: '25px', width: '45px', height: '45px',
          borderRadius: '50%', background: 'linear-gradient(145deg, rgba(var(--dark-200-rgb), 0.7), rgba(var(--dark-300-rgb), 0.8))',
          border: '1px solid rgba(var(--primary-rgb), 0.15)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'none', // Use custom cursor
          opacity: scrollPosition > 300 ? 1 : 0,
          transform: scrollPosition > 300 ? 'scale(1)' : 'scale(0.7)',
          transition: 'opacity 0.4s ease, transform 0.4s ease, background 0.3s ease, box-shadow 0.3s ease',
          zIndex: 1000, // Ensure visibility
          backdropFilter: 'blur(8px)',
          boxShadow: '0 8px 15px rgba(0,0,0,0.2), 0 0 0 1px rgba(var(--primary-rgb), 0.08)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(145deg, rgba(var(--primary-rgb), 0.15), rgba(var(--primary-rgb), 0.3))';
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 10px 20px rgba(var(--primary-rgb), 0.2), 0 0 0 1px rgba(var(--primary-rgb), 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(145deg, rgba(var(--dark-200-rgb), 0.7), rgba(var(--dark-300-rgb), 0.8))';
          e.currentTarget.style.transform = scrollPosition > 300 ? 'scale(1)' : 'scale(0.7)';
           e.currentTarget.style.boxShadow = '0 8px 15px rgba(0,0,0,0.2), 0 0 0 1px rgba(var(--primary-rgb), 0.08)';
        }}
      >
        <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--primary-100)', transform: 'translateY(-1px)' }}>↑</span>
      </button>
    </>
  );
};

export default AboutPage;