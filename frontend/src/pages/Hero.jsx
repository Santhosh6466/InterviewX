import React, { useEffect, useRef, useState } from 'react';
import Logo from '../components/Logo';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const topCompanies = [
  // Global
  { name: 'Google', icon: 'google', color: '#4285F4' },
  { name: 'Meta', icon: 'meta', color: '#0668E1' },
  { name: 'Amazon', icon: 'amazon', color: '#FF9900' },
  { name: 'Apple', icon: 'apple', color: '#FFFFFF' },
  { name: 'Netflix', icon: 'netflix', color: '#E50914' },
  { name: 'Stripe', icon: 'stripe', color: '#008CDD' },
  { name: 'Microsoft', icon: 'microsoft', color: '#00A4EF' },
  { name: 'Uber', icon: 'uber', color: '#FFFFFF' },
  { name: 'Spotify', icon: 'spotify', color: '#1DB954' },
  { name: 'Airbnb', icon: 'airbnb', color: '#FF5A5F' },
  // Indian
  { name: 'Flipkart', icon: 'flipkart', color: '#2874F0' },
  { name: 'Zomato', icon: 'zomato', color: '#E23744' },
  { name: 'Swiggy', icon: 'swiggy', color: '#FC8019' },
  { name: 'Paytm', icon: 'paytm', color: '#00B9F1' },
  { name: 'Razorpay', icon: 'razorpay', color: '#02042B' },
  { name: 'Zoho', icon: 'zoho', color: '#F32735' },
  { name: 'Postman', icon: 'postman', color: '#FF6C37' },
  { name: 'BrowserStack', icon: 'browserstack', color: '#0982C6' },
  { name: 'HackerRank', icon: 'hackerrank', color: '#00EA64' },
  { name: 'Freshworks', icon: 'freshworks', color: '#12344D' }
];

export default function Hero() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const initialized = useRef(false);
  const [showAllCompanies, setShowAllCompanies] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // New States for scroll tracking
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeStep, setActiveStep] = useState(0); 
  
  const glowRef = useRef(null);
  const howItWorksContainerRef = useRef(null);

  // Stats refs
  const statExperiencesRef = useRef(null);
  const statCompaniesRef = useRef(null);
  const statMembersRef = useRef(null);
  const statsAnimated = useRef(false);

  // Background Animation Setup
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    let tubesInstance = null;

    const initTubes = async () => {
      try {
        const module = await import('https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js');
        const TubesCursor = module.default;

        if (canvasRef.current && containerRef.current) {
          tubesInstance = TubesCursor(canvasRef.current, {
            tubes: {
              colors: ["#ffffff", "#a78b71", "#c9b8a0", "#18181b", "#0a0a0a"],
              lights: {
                intensity: 150,
                colors: ["#a78b71", "#c9b8a0", "#e8d5b7", "#ffffff", "#a78b71"]
              }
            }
          });

          const handleCanvasClick = () => {
            const palettes = [
              {
                tubes: ["#ffffff", "#a78b71", "#c9b8a0", "#0a0a0a"],
                lights: ["#a78b71", "#c9b8a0", "#e8d5b7", "#ffffff"]
              },
              {
                tubes: ["#ffffff", "#b38b6d", "#d9bda5", "#0a0a0a"],
                lights: ["#b38b6d", "#ebd3c0", "#f4e3d6", "#ffffff"]
              },
              {
                tubes: ["#ffffff", "#8c8275", "#bfb5a8", "#0a0a0a"],
                lights: ["#8c8275", "#d6cfc7", "#eae6e1", "#ffffff"]
              }
            ];
            const palette = palettes[Math.floor(Math.random() * palettes.length)];
            if (tubesInstance?.tubes) {
              tubesInstance.tubes.setColors(palette.tubes);
              tubesInstance.tubes.setLightsColors(palette.lights);
            }
          };
          window.addEventListener('click', handleCanvasClick);

          let mouseIdleTimer = null;
          let syntheticAngle = 0;
          let syntheticRAF = null;

          const syntheticMovement = () => {
            syntheticAngle += 0.02;
            const x = window.innerWidth / 2 + Math.cos(syntheticAngle) * (window.innerWidth / 3);
            const y = window.innerHeight / 2 + Math.sin(syntheticAngle * 0.8) * (window.innerHeight / 3);
            window.dispatchEvent(new MouseEvent('mousemove', {
              clientX: x,
              clientY: y
            }));
            syntheticRAF = requestAnimationFrame(syntheticMovement);
          };

          const startSyntheticMovement = () => {
            if (!syntheticRAF) syntheticMovement();
          };

          const stopSyntheticMovement = () => {
            if (syntheticRAF) {
              cancelAnimationFrame(syntheticRAF);
              syntheticRAF = null;
            }
          };

          const handleUserMouseMove = (e) => {
            if (!e.isTrusted) return;
            stopSyntheticMovement();
            if (mouseIdleTimer) clearTimeout(mouseIdleTimer);
            mouseIdleTimer = setTimeout(startSyntheticMovement, 2000); 
          };

          window.addEventListener('mousemove', handleUserMouseMove);
          mouseIdleTimer = setTimeout(startSyntheticMovement, 100); 

          return () => {
            window.removeEventListener('click', handleCanvasClick);
            window.removeEventListener('mousemove', handleUserMouseMove);
            stopSyntheticMovement();
            if (mouseIdleTimer) clearTimeout(mouseIdleTimer);
          };
        }
      } catch (err) {
        console.error('Three.js component failed to load:', err);
        if (containerRef.current) {
          containerRef.current.style.background = 'radial-gradient(circle at center, #111 0%, #000 100%)';
        }
      }
    };

    initTubes();
  }, []);

  // Scroll Tracking for Nav, Parallax, and Sticky Section
  useEffect(() => {
    let scrollRAF = null;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const handleScroll = () => {
      if (scrollRAF) return;
      scrollRAF = requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        
        // Nav Bar Shrink
        setIsScrolled(currentScrollY > 80);
        
        // Parallax Glow
        if (glowRef.current && currentScrollY < window.innerHeight * 1.5) {
            glowRef.current.style.transform = `translate(-50%, calc(-50% + ${currentScrollY * 0.5}px))`;
        }
        
        // How It Works Sticky progress
        if (howItWorksContainerRef.current) {
           const containerTop = howItWorksContainerRef.current.offsetTop;
           // Subtracting window innerHeight ensures progress is relative to scroll area
           const containerHeight = howItWorksContainerRef.current.offsetHeight - window.innerHeight;
           
           if (containerHeight > 0) {
              const progress = Math.max(0, Math.min(1, (currentScrollY - containerTop) / containerHeight));
              if (progress < 0.33) setActiveStep(0);
              else if (progress < 0.66) setActiveStep(1);
              else setActiveStep(2);
           }
        }
        
        scrollRAF = null;
      });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollRAF) cancelAnimationFrame(scrollRAF);
    };
  }, []);

  // Intersection Observer for Reveal and Stats Counters
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      document.querySelectorAll('.reveal-on-scroll, .reveal-scale, .stats-section').forEach(el => {
         el.classList.add('in-view');
      });
      if (statExperiencesRef.current) statExperiencesRef.current.innerHTML = "400+";
      if (statCompaniesRef.current) statCompaniesRef.current.innerHTML = "100+";
      if (statMembersRef.current) statMembersRef.current.innerHTML = "100+";
      return;
    }

    let ctx;
    if (!prefersReducedMotion) {
      ctx = gsap.context(() => {
        // Crazy but professional GSAP animation for Recent Experiences
        gsap.fromTo(".experience-card", 
          { 
            opacity: 0, 
            y: 120, 
            rotationX: -25, 
            scale: 0.9,
            transformPerspective: 1000 
          },
          {
            opacity: 1,
            y: 0,
            rotationX: 0,
            scale: 1,
            duration: 1.2,
            stagger: 0.15,
            ease: "expo.out",
            scrollTrigger: {
              trigger: ".experience-grid",
              start: "top 85%",
            }
          }
        );
      });
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
         if (entry.isIntersecting) {
            if (entry.target.classList.contains('stats-section') && !statsAnimated.current) {
               statsAnimated.current = true;
               animateValue(statExperiencesRef.current, 0, 400, 1500, "+");
               animateValue(statCompaniesRef.current, 0, 100, 1500, "+");
               animateValue(statMembersRef.current, 0, 100, 1500, "+");
            }
            
            entry.target.classList.add('in-view');
            obs.unobserve(entry.target);
         }
      });
    }, { threshold: 0.15 });
    
    document.querySelectorAll('.reveal-on-scroll, .reveal-scale, .stats-section').forEach(el => {
       observer.observe(el);
    });
    
    return () => {
      observer.disconnect();
      if (ctx) ctx.revert();
    };
  }, [showAllCompanies]);

  // Easing function for counters
  const easeOutExpo = (x) => {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
  };
  
  const animateValue = (obj, start, end, duration, suffix = "") => {
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = easeOutExpo(progress);
      
      const currentVal = Math.floor(easedProgress * (end - start) + start);
      obj.innerHTML = currentVal.toLocaleString() + suffix;
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  };

  return (
    <div className="bg-theme-main flex flex-col items-center w-full max-w-[100vw] selection:bg-theme-hover overflow-x-clip">
      <div className="w-full flex flex-col items-center relative">

      {/* Nav Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'py-4 bg-theme-main/80 backdrop-blur-lg shadow-sm' : 'py-10 bg-transparent'}`}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 flex justify-between items-center">
            <a href="#/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Logo className="h-7 w-auto text-theme-text" />
            <span className="display-font text-xl font-bold tracking-tight text-theme-text">InterviewX</span>
            </a>

            <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-theme-muted">
            <a href="#companies" className="hover:text-theme-text transition-colors">Companies</a>
            <a href="#" className="hover:text-theme-text transition-colors">Experiences</a>
            <a href="#" className="hover:text-theme-text transition-colors">About</a>
            <a href="#/signin" className="hover:text-theme-text transition-colors">Sign In</a>
            <a href="#/signup" className="text-theme-text border-b border-theme-border-inverted pb-0.5 hover:border-theme-inverted transition-all">Get Started</a>
            </nav>

            <button
            className="md:hidden text-theme-text text-2xl flex items-center z-50 relative"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
            <iconify-icon icon={isMobileMenuOpen ? "lucide:x" : "lucide:menu"}></iconify-icon>
            </button>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-theme-main/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8 fade-in-up">
          <a href="#companies" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold text-theme-muted hover:text-theme-text transition-colors">Companies</a>
          <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold text-theme-muted hover:text-theme-text transition-colors">Experiences</a>
          <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold text-theme-muted hover:text-theme-text transition-colors">About</a>
          <a href="#/signin" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold text-theme-text mt-4">Sign In</a>
          <a href="#/signup" onClick={() => setIsMobileMenuOpen(false)} className="px-8 py-3 bg-theme-inverted text-theme-inverted-text font-bold rounded-sm hover:bg-theme-inverted/90 transition-colors">Get Started</a>
        </div>
      )}

      {/* Hero Wrapper */}
      <div className="relative w-full min-h-screen flex flex-col items-center justify-center pt-20">
        {/* Background Layer */}
        <div ref={containerRef} id="canvas-container" className="absolute inset-0 z-0 pointer-events-none">
          <canvas ref={canvasRef} id="tubes-canvas" className="block w-full h-full"></canvas>
        </div>

        {/* Content */}
        <main className="relative z-10 w-full flex-1 max-w-5xl px-8 flex flex-col items-center justify-center text-center pb-20 mt-12 md:mt-20">
          
          {/* Decorative gold glow background orb - Parallax enabled */}
          <div ref={glowRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-[#a78b71]/20 blur-[120px] pointer-events-none -z-10 will-change-transform"></div>

          <div className="reveal-on-scroll mb-6 inline-flex items-center px-4 py-1.5 rounded-sm border border-theme-border bg-theme-hover gold-glow">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-theme-muted">DISCOVER & SHARE</span>
          </div>

          <h1 className="reveal-on-scroll display-font text-5xl md:text-7xl lg:text-8xl font-bold text-theme-text max-w-4xl leading-[1.05] tracking-tight mb-8" style={{ transitionDelay: '50ms' }}>
            InterviewX
          </h1>

          <p className="reveal-on-scroll text-theme-muted text-lg md:text-xl max-w-2xl leading-relaxed mb-12 font-light" style={{ transitionDelay: '100ms' }}>
            Learn how candidates cracked interviews at top companies. Explore interview rounds, technical questions, HR questions, and preparation tips shared by the community.
          </p>

          <div className="reveal-on-scroll flex flex-col sm:flex-row gap-5 items-center" style={{ transitionDelay: '150ms' }}>
            <a href="#/signin" className="px-10 py-4 bg-theme-inverted text-zinc-950 font-bold rounded-sm hover:opacity-80 transition-all flex items-center gap-2">
              Explore Experiences
              <iconify-icon icon="lucide:chevron-right" className="text-lg"></iconify-icon>
            </a>
            <a href="#/signup" className="px-10 py-4 minimal-glass text-theme-text font-medium rounded-sm hover:bg-theme-hover transition-all">
              Share Experience
            </a>
          </div>
        </main>
      </div>

      {/* Stats Section */}
      <section className="stats-section relative z-10 w-full max-w-5xl px-8 py-20 mx-auto flex flex-col md:flex-row items-center justify-between gap-10 text-center md:text-left bg-theme-main">
        <div className="flex flex-col gap-2 flex-1 items-center md:items-start reveal-on-scroll" style={{ transitionDelay: '0ms' }}>
           <span ref={statExperiencesRef} className="display-font text-4xl md:text-5xl font-bold text-theme-text">0</span>
           <span className="text-theme-muted text-sm font-bold tracking-widest uppercase mt-2">Experiences Shared</span>
        </div>
        <div className="hidden md:block w-px h-16 bg-theme-border"></div>
        <div className="flex flex-col gap-2 flex-1 items-center reveal-on-scroll" style={{ transitionDelay: '100ms' }}>
           <span ref={statCompaniesRef} className="display-font text-4xl md:text-5xl font-bold text-theme-text">0</span>
           <span className="text-theme-muted text-sm font-bold tracking-widest uppercase mt-2">Companies</span>
        </div>
        <div className="hidden md:block w-px h-16 bg-theme-border"></div>
        <div className="flex flex-col gap-2 flex-1 items-center md:items-end reveal-on-scroll" style={{ transitionDelay: '200ms' }}>
           <span ref={statMembersRef} className="display-font text-4xl md:text-5xl font-bold text-theme-text">0</span>
           <span className="text-theme-muted text-sm font-bold tracking-widest uppercase mt-2">Members</span>
        </div>
      </section>

      {/* Companies Section */}
      <section id="companies" className="relative z-10 w-full max-w-[1600px] px-4 sm:px-8 pt-16 border-t border-theme-border text-center bg-theme-main overflow-hidden">
        <p className="reveal-on-scroll text-[11px] uppercase tracking-[0.2em] text-theme-muted mb-10 font-bold">EXPERIENCES FROM TOP COMPANIES</p>
        
        {/* Infinite Smooth Scrolling Marquee */}
        <div className="relative w-full overflow-hidden pb-16">
          {/* Gradient Edge Masks for Smooth Aesthetic Fade */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-theme-main via-theme-main/80 to-transparent z-20"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-theme-main via-theme-main/80 to-transparent z-20"></div>

          {/* Marquee Track 1 (Left Scrolling) */}
          <div className="animate-marquee-left flex items-center gap-6 py-2">
            {[...topCompanies, ...topCompanies].map((company, index) => (
              <a
                key={`m1-${company.name}-${index}`}
                href="#/companies"
                className="flex items-center gap-3 px-6 py-3.5 rounded-sm minimal-glass hover:bg-theme-hover border border-theme-border hover:border-theme-border-inverted transition-all duration-300 cursor-pointer flex-shrink-0 group"
              >
                <div className="w-10 h-10 rounded-sm bg-theme-main flex items-center justify-center border border-theme-border group-hover:scale-110 transition-transform">
                  <iconify-icon
                    icon={`simple-icons:${company.icon}`}
                    style={{ color: company.color }}
                    className="text-2xl transition-all group-hover:drop-shadow-[0_0_10px_currentColor]"
                  ></iconify-icon>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold text-theme-text group-hover:text-[#a78b71] transition-colors">{company.name}</span>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-theme-muted">Explore</span>
                </div>
              </a>
            ))}
          </div>

          {/* Marquee Track 2 (Right Scrolling) */}
          <div className="animate-marquee-right flex items-center gap-6 py-2 mt-4">
            {[...topCompanies.slice(10), ...topCompanies.slice(0, 10), ...topCompanies.slice(10), ...topCompanies.slice(0, 10)].map((company, index) => (
              <a
                key={`m2-${company.name}-${index}`}
                href="#/companies"
                className="flex items-center gap-3 px-6 py-3.5 rounded-sm minimal-glass hover:bg-theme-hover border border-theme-border hover:border-theme-border-inverted transition-all duration-300 cursor-pointer flex-shrink-0 group"
              >
                <div className="w-10 h-10 rounded-sm bg-theme-main flex items-center justify-center border border-theme-border group-hover:scale-110 transition-transform">
                  <iconify-icon
                    icon={`simple-icons:${company.icon}`}
                    style={{ color: company.color }}
                    className="text-2xl transition-all group-hover:drop-shadow-[0_0_10px_currentColor]"
                  ></iconify-icon>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold text-theme-text group-hover:text-[#a78b71] transition-colors">{company.name}</span>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-theme-muted">Explore</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Sticky Section */}
      <section ref={howItWorksContainerRef} className="relative z-10 w-full bg-theme-sidebar h-[300vh] border-y border-theme-border">
        <div className="sticky top-0 w-full h-screen flex flex-col md:flex-row items-center justify-center gap-12 max-w-6xl mx-auto px-8 py-20 overflow-hidden">
           
           <div className="flex-1 w-full text-center md:text-left">
              <p className="text-[11px] uppercase tracking-[0.2em] text-theme-inverted mb-6 font-bold">HOW INTERVIEWX WORKS</p>
              
              <div className="relative h-48 md:h-64">
                 {/* Step 1 */}
                 <div className={`absolute inset-0 transition-all duration-700 transform ${activeStep === 0 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8 pointer-events-none'}`}>
                    <h2 className="display-font text-4xl md:text-5xl font-bold text-theme-text mb-4">Share your experience</h2>
                    <p className="text-theme-muted text-lg leading-relaxed">Document your interview journey, the rounds you faced, and the questions you were asked. Give back to the community that helps you grow.</p>
                 </div>
                 
                 {/* Step 2 */}
                 <div className={`absolute inset-0 transition-all duration-700 transform ${activeStep === 1 ? 'opacity-100 translate-y-0' : activeStep < 1 ? 'opacity-0 translate-y-8 pointer-events-none' : 'opacity-0 -translate-y-8 pointer-events-none'}`}>
                    <h2 className="display-font text-4xl md:text-5xl font-bold text-theme-text mb-4">Get upvoted</h2>
                    <p className="text-theme-muted text-lg leading-relaxed">High-quality, detailed experiences get recognized by the community. Build your reputation as a helpful contributor in the tech ecosystem.</p>
                 </div>
                 
                 {/* Step 3 */}
                 <div className={`absolute inset-0 transition-all duration-700 transform ${activeStep === 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
                    <h2 className="display-font text-4xl md:text-5xl font-bold text-theme-text mb-4">Help others prep</h2>
                    <p className="text-theme-muted text-lg leading-relaxed">Your insights could be the key to someone else landing their dream job. Foster a culture of knowledge sharing and mutual success.</p>
                 </div>
              </div>
           </div>
           
           <div className="flex-1 w-full h-64 md:h-96 relative flex items-center justify-center">
              {/* Step UI Graphics */}
              <div className={`absolute inset-0 premium-card flex flex-col items-center justify-center transition-all duration-700 transform ${activeStep === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                 <iconify-icon icon="lucide:pen-line" class="text-6xl text-theme-inverted mb-6"></iconify-icon>
                 <div className="w-3/4 h-2 bg-theme-border rounded-full mb-3"></div>
                 <div className="w-1/2 h-2 bg-theme-border rounded-full"></div>
              </div>
              <div className={`absolute inset-0 premium-card flex flex-col items-center justify-center transition-all duration-700 transform ${activeStep === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                 <iconify-icon icon="lucide:arrow-up-circle" class="text-6xl text-theme-inverted mb-6"></iconify-icon>
                 <span className="text-2xl font-bold text-theme-text">+42 Upvotes</span>
              </div>
              <div className={`absolute inset-0 premium-card flex flex-col items-center justify-center transition-all duration-700 transform ${activeStep === 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                 <iconify-icon icon="lucide:users" class="text-6xl text-theme-inverted mb-6"></iconify-icon>
                 <span className="text-xl font-bold text-theme-text">Community Impact</span>
              </div>
           </div>
           
        </div>
      </section>

      {/* Experience Gallery Teaser */}
      <section className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-8 py-32 bg-theme-main text-center">
         <div className="reveal-on-scroll mb-16">
            <h2 className="display-font text-4xl md:text-5xl font-bold text-theme-text mb-4">Recent Experiences</h2>
            <p className="text-theme-muted text-lg">Read firsthand accounts of recent interviews.</p>
         </div>
         
         <div className="experience-grid grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-6xl mx-auto" style={{ perspective: '1000px' }}>
            <div className="experience-card premium-card flex flex-col gap-4">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-theme-border flex items-center justify-center">
                     <iconify-icon icon="simple-icons:google" style={{color: '#4285F4'}}></iconify-icon>
                  </div>
                  <div>
                     <h3 className="font-bold text-theme-text">Software Engineer L4</h3>
                     <p className="text-xs text-theme-muted">Google • 2 weeks ago</p>
                  </div>
               </div>
               <p className="text-sm text-theme-muted flex-1">"Focus on dynamic programming and system design tradeoffs. The behavioral round was very standard..."</p>
               <a href="#/signin" className="gold-text-link text-sm mt-4">Read full experience <iconify-icon icon="lucide:arrow-right"></iconify-icon></a>
            </div>
            
            <div className="experience-card premium-card flex flex-col gap-4">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-theme-border flex items-center justify-center">
                     <iconify-icon icon="simple-icons:meta" style={{color: '#0668E1'}}></iconify-icon>
                  </div>
                  <div>
                     <h3 className="font-bold text-theme-text">Front End Engineer</h3>
                     <p className="text-xs text-theme-muted">Meta • 3 weeks ago</p>
                  </div>
               </div>
               <p className="text-sm text-theme-muted flex-1">"Heavy focus on React performance, virtualization, and DOM manipulation. Standard system design..."</p>
               <a href="#/signin" className="gold-text-link text-sm mt-4">Read full experience <iconify-icon icon="lucide:arrow-right"></iconify-icon></a>
            </div>
            
            <div className="experience-card premium-card flex flex-col gap-4">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-theme-border flex items-center justify-center">
                     <iconify-icon icon="simple-icons:amazon" style={{color: '#FF9900'}}></iconify-icon>
                  </div>
                  <div>
                     <h3 className="font-bold text-theme-text">SDE II</h3>
                     <p className="text-xs text-theme-muted">Amazon • 1 month ago</p>
                  </div>
               </div>
               <p className="text-sm text-theme-muted flex-1">"Leadership Principles are crucial. Prepare at least two stories for every principle. Coding was leetcode medium."</p>
               <a href="#/signin" className="gold-text-link text-sm mt-4">Read full experience <iconify-icon icon="lucide:arrow-right"></iconify-icon></a>
            </div>
         </div>
         
         <div className="mt-16 reveal-on-scroll">
            <a href="#/signin" className="btn-secondary">View all experiences</a>
         </div>
      </section>

      {/* Premium Footer */}
      <footer className="relative z-10 w-full border-t border-theme-border pt-16 pb-8 px-4 sm:px-8 bg-theme-sidebar">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-10 md:gap-0">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Logo className="h-7 w-auto text-theme-text" />
              <span className="display-font text-xl font-bold tracking-tight text-theme-text">InterviewX</span>
            </div>
            <p className="text-theme-muted text-sm max-w-xs font-medium leading-relaxed">Real interview experiences, community-driven insights, and the ultimate tech preparation toolkit.</p>
          </div>

          <div className="flex flex-wrap gap-12 sm:gap-20 text-sm">
            <div className="flex flex-col gap-4 reveal-on-scroll" style={{ transitionDelay: '100ms' }}>
              <span className="text-theme-text font-bold tracking-widest uppercase text-xs">Product</span>
              <a href="#" className="text-theme-muted hover:text-theme-text transition-colors">Experiences</a>
              <a href="#" className="text-theme-muted hover:text-theme-text transition-colors">Companies</a>
              <a href="#" className="text-theme-muted hover:text-theme-text transition-colors">Salaries</a>
            </div>
            <div className="flex flex-col gap-4 reveal-on-scroll" style={{ transitionDelay: '200ms' }}>
              <span className="text-theme-text font-bold tracking-widest uppercase text-xs">Company</span>
              <a href="#" className="text-theme-muted hover:text-theme-text transition-colors">About Us</a>
              <a href="#" className="text-theme-muted hover:text-theme-text transition-colors">Careers</a>
              <a href="#" className="text-theme-muted hover:text-theme-text transition-colors">Contact</a>
            </div>
            <div className="flex flex-col gap-4 reveal-on-scroll" style={{ transitionDelay: '300ms' }}>
              <span className="text-theme-text font-bold tracking-widest uppercase text-xs">Legal</span>
              <a href="#" className="text-theme-muted hover:text-theme-text transition-colors">Privacy</a>
              <a href="#" className="text-theme-muted hover:text-theme-text transition-colors">Terms</a>
            </div>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto mt-16 pt-8 border-t border-theme-border flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-theme-muted text-xs font-bold tracking-widest uppercase">&copy; {new Date().getFullYear()} InterviewX. All rights reserved.</p>
          <div className="flex gap-6 text-theme-muted text-xl">
            <a href="#" className="hover:text-theme-text transition-colors"><iconify-icon icon="simple-icons:x"></iconify-icon></a>
            <a href="#" className="hover:text-theme-text transition-colors"><iconify-icon icon="simple-icons:github"></iconify-icon></a>
            <a href="#" className="hover:text-theme-text transition-colors"><iconify-icon icon="simple-icons:linkedin"></iconify-icon></a>
            <a href="#" className="hover:text-theme-text transition-colors"><iconify-icon icon="simple-icons:discord"></iconify-icon></a>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
