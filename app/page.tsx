"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { useAudioManager } from "@/hooks/useAudioManager";

// Dynamically import WebGL Experience with SSR disabled (avoid server-side WebGL errors)
const Experience = dynamic(() => import("@/components/experience/Experience"), {
  ssr: false,
});

export default function Home() {
  const { audioEnabled, toggleAudio } = useAudioManager();
  const [activeSection, setActiveSection] = useState(0);
  const [flash, setFlash] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    business: "",
    email: "",
    phone: "",
    package: "",
    service: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Monitor active scroll section for navigation highlighting and text entries
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            setActiveSection(index);
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.4 }
    );

    sectionRefs.current.forEach((sec) => {
      if (sec) observer.observe(sec);
    });

    return () => observer.disconnect();
  }, []);

  // Listen for the photoshot flash event dispatched from WebGL
  useEffect(() => {
    const handleFlash = () => {
      setFlash(true);
      // Play a camera shutter click sound
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-84.wav");
      audio.volume = 0.5;
      audio.play().catch(() => {}); // catch autoplay blocks gracefully
      
      setTimeout(() => {
        setFlash(false);
      }, 150);
    };

    window.addEventListener("trigger-photoshoot-flash", handleFlash);
    return () => window.removeEventListener("trigger-photoshoot-flash", handleFlash);
  }, []);

  // Form submission handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError("");

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState),
      });

      if (!response.ok) {
        throw new Error("Unable to submit. Please try again.");
      }

      setSubmitSuccess(true);
      setFormState({
        name: "",
        business: "",
        email: "",
        phone: "",
        package: "",
        service: "",
        message: "",
      });
    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const navItems = [
    { label: "Humble Beginnings", target: 0 },
    { label: "Struggles", target: 1 },
    { label: "Breakthrough", target: 2 },
    { label: "Photoshoot", target: 3 },
    { label: "Influence", target: 4 },
    { label: "Growth", target: 5 },
    { label: "Empire", target: 6 },
    { label: "Scale Now", target: 7 },
  ];

  const scrollToSection = (index: number) => {
    const target = sectionRefs.current[index];
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative min-h-screen font-sans selection:bg-accent/40 selection:text-white">
      {/* 🚀 FIXED HEADER NAVIGATION */}
      <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-[#0a0a0f]/75 border-b border-white/[0.06] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-bold tracking-tight font-display">
            Your<span className="text-[#7f77dd]">Brand</span>
          </div>
          <ul className="hidden lg:flex items-center gap-6">
            {navItems.map((item, idx) => (
              <li key={idx}>
                <button
                  onClick={() => scrollToSection(item.target)}
                  className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
                    activeSection === item.target
                      ? "text-[#7f77dd]"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleAudio}
              className="p-2 text-white/70 hover:text-white transition-colors"
              title={audioEnabled ? "Mute Audio" : "Unmute Audio"}
            >
              {audioEnabled ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zm12.364-4.636L15.364 13m0-2.828l2.586 2.586" />
                </svg>
              )}
            </button>
            <button
              onClick={() => scrollToSection(7)}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-[#7f77dd] text-white rounded-md hover:bg-[#6c62cf] transition-all hover:scale-105"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* 📺 WEBGL 3D EXPERIENCE BACKGROUND CONTAINER */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
        <Experience />
      </div>

      {/* 📸 PHOTOSHOOT FLASH OVERLAY */}
      <div
        className={`fixed inset-0 z-40 bg-white pointer-events-none transition-opacity duration-150 ${
          flash ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* ✍️ SCROLLABLE HTML NARRATIVE OVERLAYS */}
      <div className="relative z-10 w-full">
        {/* Section 1: Humble Beginnings */}
        <div
          ref={(el) => { sectionRefs.current[0] = el; }}
          data-index={0}
          className="h-screen flex items-center justify-start px-6 md:px-20 max-w-7xl mx-auto opacity-0 translate-y-12 transition-all duration-1000 [&.is-visible]:opacity-100 [&.is-visible]:translate-y-0"
        >
          <div className="max-w-md backdrop-blur-lg bg-[#0e0e15]/70 border border-white/[0.08] p-8 rounded-2xl shadow-2xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#7f77dd]">
              Chapter 01 : The Basement
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-display mt-2 mb-4 leading-tight">
              Zero leads.<br />Infinite determination.
            </h1>
            <p className="text-white/70 text-sm leading-relaxed font-light">
              In 2022, our agency was nothing more than an old laptop, a broken desk, and a dream. We had no capital, no connections, and no reputation—only the drive to figure out what makes brands scale.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs text-[#7f77dd] font-semibold animate-pulse">
              Scroll down to continue the story <span>↓</span>
            </div>
          </div>
        </div>

        {/* Section 2: Struggles */}
        <div
          ref={(el) => { sectionRefs.current[1] = el; }}
          data-index={1}
          className="h-screen flex items-center justify-end px-6 md:px-20 max-w-7xl mx-auto opacity-0 translate-y-12 transition-all duration-1000 [&.is-visible]:opacity-100 [&.is-visible]:translate-y-0"
        >
          <div className="max-w-md backdrop-blur-lg bg-[#140606]/70 border border-red-500/20 p-8 rounded-2xl shadow-2xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">
              Chapter 02 : The Struggles
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-display mt-2 mb-4 leading-tight">
              The Trial by Fire.
            </h1>
            <p className="text-white/70 text-sm leading-relaxed font-light">
              We spent months losing campaign budgets, getting client accounts restricted, and battling conversion failure. But every error was a coding lesson, and every lost lead became data to perfect our approach.
            </p>
          </div>
        </div>

        {/* Section 3: Breakthrough */}
        <div
          ref={(el) => { sectionRefs.current[2] = el; }}
          data-index={2}
          className="h-screen flex items-center justify-start px-6 md:px-20 max-w-7xl mx-auto opacity-0 translate-y-12 transition-all duration-1000 [&.is-visible]:opacity-100 [&.is-visible]:translate-y-0"
        >
          <div className="max-w-md backdrop-blur-lg bg-[#061114]/70 border border-cyan-500/20 p-8 rounded-2xl shadow-2xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
              Chapter 03 : The Engine
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-display mt-2 mb-4 leading-tight">
              The Code is Cracked.
            </h1>
            <p className="text-white/70 text-sm leading-relaxed font-light">
              We designed an automated marketing system that did not rely on guess-work. By combining advanced consumer analytics with AI scaling tools, we built a conversion engine that generates predictable growth.
            </p>
          </div>
        </div>

        {/* Section 4: Photoshoot */}
        <div
          ref={(el) => { sectionRefs.current[3] = el; }}
          data-index={3}
          className="h-screen flex items-center justify-end px-6 md:px-20 max-w-7xl mx-auto opacity-0 translate-y-12 transition-all duration-1000 [&.is-visible]:opacity-100 [&.is-visible]:translate-y-0"
        >
          <div className="max-w-md backdrop-blur-lg bg-[#0e0e15]/75 border border-white/10 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">
              Chapter 04 : The Spotlight
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-display mt-2 mb-4 leading-tight">
              Your turn in the spotlight.
            </h1>
            <p className="text-white/70 text-sm leading-relaxed font-light">
              Our breakthrough meant our clients started winning. We put them at the center of their markets, flashing studio lights on their brands, capturing the industry’s attention, and turning them into market leaders.
            </p>
          </div>
        </div>

        {/* Section 5: Trophy Room */}
        <div
          ref={(el) => { sectionRefs.current[4] = el; }}
          data-index={4}
          className="h-screen flex items-center justify-start px-6 md:px-20 max-w-7xl mx-auto opacity-0 translate-y-12 transition-all duration-1000 [&.is-visible]:opacity-100 [&.is-visible]:translate-y-0"
        >
          <div className="max-w-md backdrop-blur-lg bg-[#141206]/70 border border-yellow-500/20 p-8 rounded-2xl shadow-2xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37]">
              Chapter 05 : Influence
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-display mt-2 mb-4 leading-tight">
              Influence That Commands Authority.
            </h1>
            <p className="text-white/70 text-sm leading-relaxed font-light">
              Trophies and industry recognition aren’t given—they are manufactured. With over 50+ successful campaigns launched, and verified growth badges, we cemented our clients’ positions as trusted niche authorities.
            </p>
          </div>
        </div>

        {/* Section 6: Influx */}
        <div
          ref={(el) => { sectionRefs.current[5] = el; }}
          data-index={5}
          className="h-screen flex items-center justify-end px-6 md:px-20 max-w-7xl mx-auto opacity-0 translate-y-12 transition-all duration-1000 [&.is-visible]:opacity-100 [&.is-visible]:translate-y-0"
        >
          <div className="max-w-md backdrop-blur-lg bg-[#061412]/70 border border-emerald-500/20 p-8 rounded-2xl shadow-2xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#00ffcc]">
              Chapter 06 : Client Influx
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-display mt-2 mb-4 leading-tight">
              Predictable client streams.
            </h1>
            <p className="text-white/70 text-sm leading-relaxed font-light">
              No more client dry spells. Our active lead capture pipelines run in the background, feeding a continuous stream of premium, qualified clients directly into our clients' business ecosystem.
            </p>
          </div>
        </div>

        {/* Section 7: The Empire & Pricing Packages */}
        <div
          ref={(el) => { sectionRefs.current[6] = el; }}
          data-index={6}
          className="min-h-screen flex flex-col justify-center py-20 px-6 md:px-20 max-w-7xl mx-auto opacity-0 translate-y-12 transition-all duration-1000 [&.is-visible]:opacity-100 [&.is-visible]:translate-y-0"
        >
          <div className="max-w-5xl w-full backdrop-blur-md bg-[#0a0a0f]/50 border border-white/[0.05] p-8 md:p-12 rounded-3xl shadow-2xl">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#7f77dd]">
                Chapter 07 : The Empire
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-display mt-2 mb-4">
                The Scale Architecture
              </h1>
              <p className="text-white/60 text-sm">
                Choose a pricing tier tailored to your current stage. From startups to market-dominant empires.
              </p>
            </div>

            {/* Pricing Packages Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Starter Package */}
              <div className="backdrop-blur-lg bg-[#13131c]/80 border border-white/[0.08] p-6 rounded-2xl relative flex flex-col">
                <h3 className="text-lg font-bold">Starter Setup</h3>
                <div className="text-2xl font-black mt-2 text-[#7f77dd]">₹9,999<span className="text-xs font-normal text-white/50">/month</span></div>
                <p className="text-xs text-white/60 mt-2 flex-grow">Perfect for small businesses starting their digital journey.</p>
                <ul className="text-[11px] text-white/70 space-y-2 mt-4 mb-6 border-t border-white/10 pt-4">
                  <li>✓ 2 Managed Social Platforms</li>
                  <li>✓ 12 Targeted Posts / Month</li>
                  <li>✓ Core SEO Optimization</li>
                  <li>✓ Monthly Analytics Report</li>
                </ul>
                <button onClick={() => scrollToSection(7)} className="w-full py-2 text-xs font-bold uppercase tracking-wider border border-[#7f77dd]/40 text-[#7f77dd] rounded-lg hover:bg-[#7f77dd] hover:text-white transition-all">
                  Select Starter
                </button>
              </div>

              {/* Growth Package */}
              <div className="backdrop-blur-lg bg-[#181829]/95 border border-[#7f77dd] p-6 rounded-2xl relative flex flex-col scale-105 shadow-xl">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#7f77dd] text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
                <h3 className="text-lg font-bold mt-2">Growth Accelerator</h3>
                <div className="text-2xl font-black mt-2 text-[#7f77dd]">₹24,999<span className="text-xs font-normal text-white/50">/month</span></div>
                <p className="text-xs text-white/60 mt-2 flex-grow">For scaling startups ready to drive multi-channel marketing campaigns.</p>
                <ul className="text-[11px] text-white/70 space-y-2 mt-4 mb-6 border-t border-white/10 pt-4">
                  <li>✓ 4 Managed Platforms</li>
                  <li>✓ 24 Posts + 8 Reels / Month</li>
                  <li>✓ Google & Meta Paid Ads Setup</li>
                  <li>✓ Full SEO + Email Campaigns</li>
                  <li>✓ Dedicated Account Strategist</li>
                </ul>
                <button onClick={() => scrollToSection(7)} className="w-full py-2 text-xs font-bold uppercase tracking-wider bg-[#7f77dd] text-white rounded-lg hover:bg-[#6c62cf] transition-all">
                  Select Growth
                </button>
              </div>

              {/* Pro Package */}
              <div className="backdrop-blur-lg bg-[#13131c]/80 border border-white/[0.08] p-6 rounded-2xl relative flex flex-col">
                <h3 className="text-lg font-bold">Empire Pro</h3>
                <div className="text-2xl font-black mt-2 text-[#7f77dd]">₹49,999<span className="text-xs font-normal text-white/50">/month</span></div>
                <p className="text-xs text-white/60 mt-2 flex-grow">Complete full-service agency treatment to dominate your industry space.</p>
                <ul className="text-[11px] text-white/70 space-y-2 mt-4 mb-6 border-t border-white/10 pt-4">
                  <li>✓ Full Omnichannel Coverage</li>
                  <li>✓ Unlimited Content & Reels</li>
                  <li>✓ Custom AI-Powered Ad Campaigns</li>
                  <li>✓ PR & Reputation Distribution</li>
                  <li>✓ Weekly Strategy Reviews</li>
                </ul>
                <button onClick={() => scrollToSection(7)} className="w-full py-2 text-xs font-bold uppercase tracking-wider border border-[#7f77dd]/40 text-[#7f77dd] rounded-lg hover:bg-[#7f77dd] hover:text-white transition-all">
                  Select Pro
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 8: Finale & Lead Capture Form */}
        <div
          ref={(el) => { sectionRefs.current[7] = el; }}
          data-index={7}
          className="min-h-screen flex items-center justify-center py-20 px-6 md:px-20 max-w-7xl mx-auto opacity-0 translate-y-12 transition-all duration-1000 [&.is-visible]:opacity-100 [&.is-visible]:translate-y-0"
        >
          <div className="max-w-2xl w-full backdrop-blur-lg bg-[#0a0a0f]/80 border border-white/[0.08] p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-[#7f77dd]/10 rounded-full blur-3xl" />
            
            <div className="text-center mb-8">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#7f77dd]">
                Finale : Begin Your Journey
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight font-display mt-2 mb-3">
                Let's Build Your Empire
              </h2>
              <p className="text-white/60 text-xs">
                Fill in the details below. Our growth team will get back to you within 24 hours with a custom roadmap.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formState.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Gaurav Agrawal"
                    className="w-full bg-[#13131c] border border-white/[0.08] rounded-lg px-4 py-2 text-xs focus:border-[#7f77dd] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1">Business Name</label>
                  <input
                    type="text"
                    name="business"
                    value={formState.business}
                    onChange={handleInputChange}
                    placeholder="Your Company"
                    className="w-full bg-[#13131c] border border-white/[0.08] rounded-lg px-4 py-2 text-xs focus:border-[#7f77dd] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formState.email}
                    onChange={handleInputChange}
                    required
                    placeholder="you@company.com"
                    className="w-full bg-[#13131c] border border-white/[0.08] rounded-lg px-4 py-2 text-xs focus:border-[#7f77dd] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formState.phone}
                    onChange={handleInputChange}
                    placeholder="+91 00000 00000"
                    className="w-full bg-[#13131c] border border-white/[0.08] rounded-lg px-4 py-2 text-xs focus:border-[#7f77dd] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1">Select Package</label>
                  <select
                    name="package"
                    value={formState.package}
                    onChange={handleInputChange}
                    className="w-full bg-[#13131c] border border-white/[0.08] rounded-lg px-4 py-2 text-xs focus:border-[#7f77dd] focus:outline-none transition-colors appearance-none"
                  >
                    <option value="">Choose a tier...</option>
                    <option value="Starter">Starter Setup — ₹9,999</option>
                    <option value="Growth">Growth Accelerator — ₹24,999</option>
                    <option value="Pro">Empire Pro — ₹49,999</option>
                    <option value="Custom">Custom / Not Sure</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1">Primary Goal</label>
                  <select
                    name="service"
                    value={formState.service}
                    onChange={handleInputChange}
                    className="w-full bg-[#13131c] border border-white/[0.08] rounded-lg px-4 py-2 text-xs focus:border-[#7f77dd] focus:outline-none transition-colors appearance-none"
                  >
                    <option value="">Primary target...</option>
                    <option value="Leads">Lead Generation</option>
                    <option value="Socials">Social Media Scale</option>
                    <option value="SEO">Organic SEO Rank</option>
                    <option value="Ads">Paid Ad Optimization</option>
                    <option value="All">Full Agency Package</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1">About Your Growth Ambitions</label>
                <textarea
                  name="message"
                  value={formState.message}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Describe your product, current bottlenecks, and your ultimate revenue targets..."
                  className="w-full bg-[#13131c] border border-white/[0.08] rounded-lg px-4 py-2 text-xs focus:border-[#7f77dd] focus:outline-none transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#7f77dd] text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-[#6c62cf] transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Submitting Inquiry..." : "Submit Growth Request →"}
              </button>

              {/* Feedback messages */}
              {submitSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg text-center font-semibold animate-pulse">
                  🎉 Growth request sent! Our strategy team will reach out within 24 hours.
                </div>
              )}
              {submitError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg text-center font-semibold">
                  ⚠️ {submitError}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-8 border-t border-white/[0.06] backdrop-blur-md bg-[#0a0a0f]/60 text-center text-[10px] text-white/40 uppercase tracking-widest relative z-10">
          © 2026 YourBrand Agency. All rights reserved. | Built for immersive brand experiences.
        </footer>
      </div>
    </div>
  );
}
