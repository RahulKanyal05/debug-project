'use client';
import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';

const AboutPage = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollPosition, setScrollPosition] = useState(0);
  const [activeSkill, setActiveSkill] = useState<number | null>(null);
  const [cubeRotation, setCubeRotation] = useState({ x: 0, y: 0 });

  // Handle custom cursor movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // Update hero section parallax effect
      if (heroRef.current) {
        const moveX = (e.clientX - window.innerWidth / 2) / 25;
        const moveY = (e.clientY - window.innerHeight / 2) / 25;
        heroRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`;
      }

      // Update 3D cube rotation based on mouse position
      const rotateX = (e.clientY / window.innerHeight - 0.5) * 20;
      const rotateY = (e.clientX / window.innerWidth - 0.5) * 20;
      setCubeRotation({ x: rotateX, y: rotateY });
    };

    // Handle scroll for animations
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Timeline data
  const timelineItems = [
    {
      year: '1998',
      title: 'Career Launch',
      description: 'Started as a Junior Designer at Creative Solutions Agency',
      tech: 'Early web design, Flash, HTML/CSS'
    },
    {
      year: '2004',
      title: 'Senior Designer',
      description: 'Led redesign projects for Fortune 500 companies',
      tech: 'CSS3, JavaScript, PHP'
    },
    {
      year: '2010',
      title: 'Creative Director',
      description: 'Established a design department of 25+ creatives',
      tech: 'Responsive design, jQuery, Bootstrap'
    },
    {
      year: '2015',
      title: 'UX Research Lead',
      description: 'Pioneered UX methodologies for enterprise products',
      tech: 'Angular, React, SASS, LESS'
    },
    {
      year: '2020',
      title: 'Design Innovation Head',
      description: 'Leading digital transformation initiatives',
      tech: 'React Native, Vue.js, Figma, Design Systems'
    },
    {
      year: '2023',
      title: 'Independent Design Consultant',
      description: 'Working with select clients on transformative projects',
      tech: 'Next.js, Framer Motion, Three.js, TailwindCSS'
    }
  ];

  // Skills data
  const skills = [
    { name: 'UX Strategy', level: 95, color: 'var(--chart-1)' },
    { name: 'UI Design', level: 98, color: 'var(--chart-2)' },
    { name: 'Design Systems', level: 92, color: 'var(--chart-3)' },
    { name: 'Motion Design', level: 88, color: 'var(--chart-4)' },
    { name: 'Research', level: 90, color: 'var(--chart-5)' },
    { name: 'Creative Direction', level: 94, color: 'var(--chart-1)' }
  ];

  // Cube faces data
  const cubeFaces = [
    { text: 'Innovation', color: 'var(--chart-1)' },
    { text: 'Precision', color: 'var(--chart-2)' },
    { text: 'Experience', color: 'var(--chart-3)' },
    { text: 'Elegance', color: 'var(--chart-4)' },
    { text: 'Vision', color: 'var(--chart-5)' },
    { text: 'Craft', color: 'var(--primary-200)' }
  ];

  return (
    <>
      <Head>
        <title>Rahul Mehta | Senior UI/UX Designer</title>
        <meta name="description" content="25+ years of excellence in UI/UX design" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Mona+Sans:wght@200;300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      {/* Custom cursor */}
      <div 
        ref={cursorRef} 
        className="custom-cursor" 
        style={{ left: `${mousePosition.x}px`, top: `${mousePosition.y}px` }}
      >
        <div className="cursor-dot"></div>
        <div className="cursor-outline"></div>
      </div>

      <main className="main-container pattern">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-background"></div>
          <div ref={heroRef} className="hero-content">
            <div className="decorative-circle"></div>
            <div className="decorative-circle-2"></div>
            <h1 className="name-title">Rahul Mehta</h1>
            <div className="title-container">
              <h2 className="profession-title">Senior UI/UX Designer</h2>
              <p className="hero-subtitle">25+ Years Crafting Digital Experiences</p>
            </div>
            <div className="card-border hero-cta-container">
              <div className="card hero-cta">
                <p>Transforming visions into exceptional digital experiences</p>
              </div>
            </div>
          </div>
          <div className="scroll-indicator">
            <div className="scroll-line"></div>
            <p>Scroll to explore</p>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="timeline-section" ref={timelineRef}>
          <h2 className="section-title">Professional Journey</h2>
          <div className="timeline-container">
            {timelineItems.map((item, index) => {
              const scrollProgress = Math.min(
                Math.max(0, scrollPosition - 300 - index * 100) / 200,
                1
              );
              
              return (
                <div 
                  key={index} 
                  className="timeline-item"
                  style={{
                    opacity: scrollProgress,
                    transform: `translateY(${(1 - scrollProgress) * 50}px)`
                  }}
                >
                  <div className="timeline-year">{item.year}</div>
                  <div className="card-border timeline-content-wrapper">
                    <div className="card timeline-content">
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                      <div className="timeline-tech">{item.tech}</div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="timeline-line"></div>
          </div>
        </section>

        {/* Skills Section */}
        <section className="skills-section">
          <h2 className="section-title">Expertise & Skills</h2>
          <div className="skills-container">
            {skills.map((skill, index) => (
              <div 
                key={index}
                className={`skill-item ${activeSkill === index ? 'active' : ''}`}
                onMouseEnter={() => setActiveSkill(index)}
                onMouseLeave={() => setActiveSkill(null)}
              >
                <div className="skill-info">
                  <h3>{skill.name}</h3>
                  <div className="skill-bar-container">
                    <div 
                      className="skill-bar" 
                      style={{
                        width: `${activeSkill === index ? skill.level : 0}%`,
                        backgroundColor: skill.color
                      }}
                    ></div>
                  </div>
                </div>
                <div className="skill-percentage" style={{ color: skill.color }}>
                  {activeSkill === index ? `${skill.level}%` : ''}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="philosophy-section">
          <div className="philosophy-content">
            <h2 className="section-title">Design Philosophy</h2>
            <div className="quote-container">
              <span className="quote-mark">"</span>
              <p className="philosophy-quote">
                Design is not just what it looks like and feels like. Design is how it works. 
                My approach combines aesthetic excellence with functional brilliance to create
                experiences that resonate on a profound level with users.
              </p>
              <span className="quote-mark closing">"</span>
            </div>
            <div className="philosophy-principles">
              <div className="card-border principle-card-wrapper">
                <div className="card principle-card">
                  <h3>User-Centric</h3>
                  <p>Every pixel serves the user's needs</p>
                </div>
              </div>
              <div className="card-border principle-card-wrapper">
                <div className="card principle-card">
                  <h3>Elegance</h3>
                  <p>Sophistication through simplicity</p>
                </div>
              </div>
              <div className="card-border principle-card-wrapper">
                <div className="card principle-card">
                  <h3>Innovation</h3>
                  <p>Breaking boundaries with purpose</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3D Cube Section */}
        <section className="cube-section">
          <h2 className="section-title">Design Dimensions</h2>
          <p className="cube-subtitle">Hover to explore the dimensions of my design approach</p>
          <div className="cube-container">
            <div 
              className="cube" 
              style={{ 
                transform: `rotateX(${cubeRotation.x}deg) rotateY(${cubeRotation.y}deg)`
              }}
            >
              {cubeFaces.map((face, index) => (
                <div 
                  key={index} 
                  className={`cube-face face-${index + 1}`} 
                  style={{ backgroundColor: `${face.color}33` }}
                >
                  <div className="face-content">
                    <h3>{face.text}</h3>
                    <div className="face-decoration" style={{ backgroundColor: face.color }}></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="cube-shadow"></div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="contact-section">
          <div className="card-cta">
            <div className="contact-content">
              <h2>Ready to elevate your digital presence?</h2>
              <p>Let's create something extraordinary together</p>
            </div>
            <button className="btn-primary">Get In Touch</button>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Rahul Mehta. All rights reserved.</p>
        <div className="social-links">
          <a href="#" className="social-link">LinkedIn</a>
          <a href="#" className="social-link">Behance</a>
          <a href="#" className="social-link">Dribbble</a>
        </div>
      </footer>

      <style jsx>{`
        /* Base Styles */
        :global(body) {
          margin: 0;
          padding: 0;
          font-family: var(--font-mona-sans);
          
          color: var(--foreground);
          overflow-x: hidden;
          
        }

        :global(*) {
          box-sizing: border-box;
        }

        /* Custom Cursor */
        .custom-cursor {
          position: fixed;
          z-index: 9999;
          pointer-events: none;
          mix-blend-mode: difference;
        }

        .cursor-dot {
          position: absolute;
          top: -4px;
          left: -4px;
          width: 8px;
          height: 8px;
          background-color: var(--primary-200);
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }

        .cursor-outline {
          position: absolute;
          top: -16px;
          left: -16px;
          width: 32px;
          height: 32px;
          border: 2px solid var(--primary-200);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: width 0.2s, height 0.2s, top 0.2s, left 0.2s;
        }

        /* Main Container */
        .main-container {
          width: 100%;
          max-width: 100vw;
          overflow-x: hidden;
        }

        /* Hero Section */
        .hero-section {
          position: relative;
          height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .hero-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: var(--dark-100);
          z-index: -2;
        }

        .hero-content {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          z-index: 1;
          transition: transform 0.5s ease-out;
          padding: 2rem;
        }

        .decorative-circle {
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--chart-1), var(--chart-3));
          opacity: 0.1;
          filter: blur(80px);
          z-index: -1;
          top: -100px;
          left: -100px;
        }

        .decorative-circle-2 {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: linear-gradient(225deg, var(--chart-5), var(--chart-2));
          opacity: 0.1;
          filter: blur(60px);
          z-index: -1;
          bottom: -50px;
          right: -80px;
        }

        .name-title {
          font-size: 5rem;
          font-weight: 700;
          margin: 0;
          background: linear-gradient(to right, var(--primary-100), var(--primary-200));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          letter-spacing: -0.02em;
          line-height: 1.1;
          margin-bottom: 1rem;
        }

        .title-container {
          margin-bottom: 2rem;
        }

        .profession-title {
          font-size: 2.5rem;
          font-weight: 500;
          margin: 0;
          margin-bottom: 0.5rem;
          color: var(--light-100);
        }

        .hero-subtitle {
          font-size: 1.25rem;
          font-weight: 400;
          margin: 0;
          color: var(--light-400);
        }

        .hero-cta-container {
          max-width: 600px;
        }

        .hero-cta {
          padding: 2rem;
        }

        .hero-cta p {
          font-size: 1.25rem;
          margin: 0;
          text-align: center;
          color: var(--light-100);
        }

        .scroll-indicator {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: var(--light-400);
          font-size: 0.875rem;
        }

        .scroll-line {
          width: 2px;
          height: 60px;
          background: linear-gradient(to bottom, var(--primary-200), transparent);
          animation: scrollPulse 2s infinite;
        }

        @keyframes scrollPulse {
          0% {
            height: 60px;
            opacity: 1;
          }
          50% {
            height: 40px;
            opacity: 0.6;
          }
          100% {
            height: 60px;
            opacity: 1;
          }
        }

        /* Section styles */
        .section-title {
          font-size: 3rem;
          font-weight: 600;
          margin-bottom: 3rem;
          text-align: center;
          background: linear-gradient(to right, var(--light-100), var(--primary-200));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        section {
          padding: 8rem 2rem;
          margin: 0 auto;
          max-width: 1400px;
        }

        /* Timeline Section */
        .timeline-section {
          position: relative;
        }

        .timeline-container {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 4rem;
        }

        .timeline-line {
          position: absolute;
          top: 0;
          left: 100px;
          width: 2px;
          height: 100%;
          background: linear-gradient(to bottom, var(--primary-200), transparent);
          z-index: -1;
        }

        .timeline-item {
          display: flex;
          align-items: flex-start;
          gap: 3rem;
          opacity: 0;
          transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .timeline-year {
          width: 100px;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary-200);
          text-align: right;
          padding-top: 1rem;
        }

        .timeline-content-wrapper {
          flex: 1;
          max-width: 800px;
        }

        .timeline-content {
          padding: 2rem;
        }

        .timeline-content h3 {
          margin-top: 0;
          margin-bottom: 1rem;
          font-size: 1.5rem;
          color: var(--light-100);
        }

        .timeline-content p {
          margin-bottom: 1rem;
          color: var(--light-400);
        }

        .timeline-tech {
          font-size: 0.875rem;
          color: var(--primary-200);
          font-weight: 500;
        }

        /* Skills Section */
        .skills-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 2rem;
        }

        .skill-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          background: var(--dark-200);
          border-radius: 1rem;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: none;
        }

        .skill-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .skill-info {
          flex: 1;
        }

        .skill-info h3 {
          margin-top: 0;
          margin-bottom: 0.5rem;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--light-100);
        }

        .skill-bar-container {
          width: 100%;
          height: 6px;
          background: var(--dark-300);
          border-radius: 3px;
          overflow: hidden;
        }

        .skill-bar {
          height: 100%;
          width: 0;
          transition: width 1s cubic-bezier(0.26, 0.86, 0.44, 0.985);
        }

        .skill-percentage {
          width: 60px;
          text-align: right;
          font-weight: 600;
          font-size: 1.25rem;
          transition: opacity 0.5s ease;
        }

        /* Philosophy Section */
        .philosophy-section {
          text-align: center;
        }

        .philosophy-content {
          max-width: 900px;
          margin: 0 auto;
        }

        .quote-container {
          position: relative;
          margin: 3rem 0;
          padding: 2rem;
        }

        .quote-mark {
          position: absolute;
          top: -40px;
          left: -20px;
          font-size: 8rem;
          color: var(--primary-200);
          opacity: 0.2;
          font-family: serif;
          line-height: 1;
        }

        .quote-mark.closing {
          top: auto;
          left: auto;
          right: -20px;
          bottom: -100px;
        }

        .philosophy-quote {
          font-size: 1.75rem;
          line-height: 1.5;
          color: var(--light-100);
          font-weight: 300;
          position: relative;
          z-index: 1;
        }

        .philosophy-principles {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-top: 4rem;
          flex-wrap: wrap;
        }

        .principle-card-wrapper {
          width: 250px;
        }

        .principle-card {
          padding: 2rem;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .principle-card h3 {
          margin-top: 0;
          margin-bottom: 1rem;
          font-size: 1.5rem;
          color: var(--primary-200);
        }

        .principle-card p {
          margin: 0;
          color: var(--light-400);
        }

        /* Cube Section */
        .cube-section {
          text-align: center;
          height: 800px;
          position: relative;
        }

        .cube-subtitle {
          text-align: center;
          margin-bottom: 4rem;
          color: var(--light-400);
        }

        .cube-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          perspective: 1000px;
          height: 400px;
          position: relative;
        }

        .cube {
          width: 300px;
          height: 300px;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.3s ease;
        }

        .cube-face {
          position: absolute;
          width: 300px;
          height: 300px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .face-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .face-content h3 {
          font-size: 2rem;
          font-weight: 600;
          margin: 0;
          margin-bottom: 1rem;
          color: white;
        }

        .face-decoration {
          width: 50px;
          height: 5px;
          border-radius: 2.5px;
        }

        .face-1 {
          transform: translateZ(150px);
        }

        .face-2 {
          transform: rotateY(180deg) translateZ(150px);
        }

        .face-3 {
          transform: rotateY(90deg) translateZ(150px);
        }

        .face-4 {
          transform: rotateY(-90deg) translateZ(150px);
        }

        .face-5 {
          transform: rotateX(90deg) translateZ(150px);
        }

        .face-6 {
          transform: rotateX(-90deg) translateZ(150px);
        }

        .cube-shadow {
          position: absolute;
          bottom: -50px;
          width: 300px;
          height: 50px;
          background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0) 70%);
          transform: rotateX(90deg);
        }

        /* Contact Section */
        .contact-section {
          margin-bottom: 4rem;
        }

        /* Footer */
        .footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem;
          border-top: 1px solid var(--border);
          max-width: 1400px;
          margin: 0 auto;
        }

        .footer p {
          margin: 0;
          color: var(--light-600);
        }

        .social-links {
          display: flex;
          gap: 1.5rem;
        }

        .social-link {
          color: var(--light-400);
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .social-link:hover {
          color: var(--primary-200);
        }

        /* Responsive Styles */
        @media (max-width: 1024px) {
          .name-title {
            font-size: 4rem;
          }

          .profession-title {
            font-size: 2rem;
          }

          .section-title {
            font-size: 2.5rem;
          }

          .philosophy-quote {
            font-size: 1.5rem;
          }

          .timeline-line {
            left: 80px;
          }

          .timeline-year {
            width: 80px;
          }
        }

        @media (max-width: 768px) {
          .name-title {
            font-size: 3rem;
          }

          .profession-title {
            font-size: 1.5rem;
          }

          .hero-subtitle {
            font-size: 1rem;
          }

          .section-title {
            font-size: 2rem;
            margin-bottom: 2rem;
          }

          .timeline-container {
            gap: 3rem;
          }

          .timeline-item {
            gap: 1.5rem;
          }

          .timeline-year {
            width: 60px;
            font-size: 1.25rem;
          }

          .timeline-line {
            left: 60px;
          }

          .philosophy-principles {
            flex-direction: column;
            align-items: center;
          }

          .principle-card-wrapper {
            width: 100%;
            max-width: 300px;
          }

          .cube {
            width: 200px;
            height: 200px;
          }

          .cube-face {
            width: 200px;
            height: 200px;
          }

          .face-1 { transform: translateZ(100px); }
          .face-2 { transform: rotateY(180deg) translateZ(100px); }
          .face-3 { transform: rotateY(90deg) translateZ(100px); }
          .face-4 { transform: rotateY(-90deg) translateZ(100px); }
          .face-5 { transform: rotateX(90deg) translateZ(100px); }
          .face-6 { transform: rotateX(-90deg) translateZ(100px); }

          .cube-shadow {
            width: 200px;
          }

          .skills-container {
            grid-template-columns: 1fr;
          }

          .footer {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          section {
            padding: 4rem 1rem;
          }

          .name-title {
            font-size: 2.5rem;
          }

          .profession-title {
            font-size: 1.25rem;
          }

          .section-title {
            font-size: 1.75rem;
          }

          .philosophy-quote {
            font-size: 1.25rem;
          }

          .timeline-line {
            display: none;
          }

          .timeline-item {
            flex-direction: column;
            gap: 0.5rem;
          }

          .timeline-year {
            width: 100%;
            text-align: left;
            padding-top: 0;
            padding-bottom: 0.5rem;
          }
        }
      `}</style>
    </>
  );
};

export default AboutPage;