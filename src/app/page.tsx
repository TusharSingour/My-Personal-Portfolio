"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowDown,
  ArrowDownRight,
  ArrowUpRight,
  Github,
  Linkedin,
  Menu,
  X,
  MoveUpRight,
  Code2,
  Layers3,
  Terminal,
  Sparkles,
  ExternalLink,
  Sun,
  Moon,
} from "lucide-react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const links = {
  github: "https://github.com/TusharSingour",
  linkedin: "https://www.linkedin.com/in/tushar-singour",
  leetcode: "https://leetcode.com/u/Tushar_singour/",
  codechef: "https://www.codechef.com/users/tusharsingur",
  instagram: "https://www.instagram.com/tusharsingour",
};

function ParticlePortrait({ motionOn }: { motionOn: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const motionRef = useRef(motionOn);
  useEffect(() => {
    motionRef.current = motionOn;
    if (!motionOn) {
      progressRef.current = 0;
      const portrait = document.querySelector<HTMLElement>(".hero-portrait");
      const heroContent = document.querySelector<HTMLElement>(".hero-content");
      if (portrait) portrait.style.opacity = "1";
      if (heroContent) {
        heroContent.style.transform = "translateY(0px)";
        heroContent.style.opacity = "1";
      }
    } else {
      window.dispatchEvent(new Event("scroll"));
    }
  }, [motionOn]);
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    let frame = 0;
    let disposed = false;
    let points:
      | THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>
      | undefined;
    let geometry: THREE.BufferGeometry | undefined;
    let material: THREE.PointsMaterial | undefined;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.z = 8;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const image = new window.Image();
    image.src = "/images/profile/tushar-singour-studio.png";
    image.onload = () => {
      if (disposed) return;
      const canvas = document.createElement("canvas");
      const w = 240,
        h = Math.round((w * image.height) / image.width);
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(image, 0, 0, w, h);
      const pixels = ctx.getImageData(0, 0, w, h).data;
      const original: number[] = [],
        colors: number[] = [],
        seeds: number[] = [];
      for (let y = 0; y < h; y += 2) {
        for (let x = 0; x < w; x += 2) {
          const i = (y * w + x) * 4;
          if (
            pixels[i + 3] < 60 ||
            pixels[i] + pixels[i + 1] + pixels[i + 2] < 30
          )
            continue;
          // Sample the real portrait into a light, low-resolution point cloud.
          original.push(
            (x / w - 0.5) * 4.8,
            (0.5 - y / h) * 4.8 * (h / w),
            (pixels[i] / 255 - 0.5) * 0.32,
          );
          const warm = Math.random() > 0.52 || pixels[i] > pixels[i + 2] * 1.25;
          colors.push(
            warm ? 1 : 0.78,
            warm ? 0.43 + pixels[i + 1] / 950 : 0.82,
            warm ? 0.16 : 1,
          );
          seeds.push(
            Math.random() * Math.PI * 2,
            Math.random() * 1.2 + 0.3,
            Math.random() * 2 - 1,
          );
        }
      }
      const base = new Float32Array(original);
      const position = new Float32Array(original);
      geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
      geometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(colors, 3),
      );
      geometry.userData.base = base;
      geometry.userData.seeds = seeds;
      material = new THREE.PointsMaterial({
        size: 0.012,
        vertexColors: true,
        transparent: true,
        opacity: 0,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      points = new THREE.Points(geometry, material);
      points.position.set(0, 0.08, 0);
      scene.add(points);
    };
    const onScroll = () => {
      const wrapper = document.querySelector<HTMLElement>(".hero-scroll-wrap");
      const scrollRange = Math.max(
        1,
        (wrapper?.offsetHeight ?? window.innerHeight * 1.8) -
          window.innerHeight,
      );
      const travelled = wrapper
        ? -wrapper.getBoundingClientRect().top
        : window.scrollY;
      const rawProgress = Math.max(0, Math.min(1, travelled / scrollRange));
      progressRef.current = motionRef.current ? rawProgress : 0;
      const progress = progressRef.current;
      const portrait = document.querySelector<HTMLElement>(".hero-portrait");
      const heroContent = document.querySelector<HTMLElement>(".hero-content");
      // The real portrait is fully visible at first; it fades only as the scroll-linked point cloud forms.
      const photoFade = Math.max(0, Math.min(1, (progress - 0.08) / 0.62));
      if (portrait) portrait.style.opacity = String(1 - photoFade);
      if (heroContent) {
        heroContent.style.transform = `translateY(${-progress * 34}px)`;
        heroContent.style.opacity = String(
          1 - Math.max(0, progress - 0.52) * 0.25,
        );
      }
    };
    const onResize = () => {
      if (!host) return;
      camera.aspect = host.clientWidth / Math.max(1, host.clientHeight);
      camera.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    onScroll();
    const animate = (t: number) => {
      if (disposed) return;
      frame = requestAnimationFrame(animate);
      if (points && geometry) {
        const p = geometry.attributes.position.array as Float32Array;
        const base = geometry.userData.base as Float32Array;
        const seeds = geometry.userData.seeds as number[];
        const progress = motionRef.current ? progressRef.current : 0;
        const time = motionRef.current ? t * 0.00035 : 0;
        for (let i = 0; i < p.length; i += 3) {
          const n = i / 3,
            a = seeds[n * 3],
            spread = seeds[n * 3 + 1],
            z = seeds[n * 3 + 2];
          const disperse = progress * progress;
          const ripple = Math.sin(progress * Math.PI * 5 + a) * progress;
          p[i] =
            base[i] +
            Math.cos(a + time) * 0.025 +
            Math.sin(a * 2.3) * disperse * spread * 2.25 +
            Math.cos(a * 3.7) * ripple * 0.16;
          p[i + 1] =
            base[i + 1] +
            Math.sin(a + time * 1.4) * 0.025 +
            Math.cos(a * 1.7) * disperse * spread * 1.8 +
            Math.sin(a * 2.4) * ripple * 0.12;
          p[i + 2] =
            base[i + 2] + Math.sin(a + time) * 0.06 + disperse * z * 2.3;
        }
        geometry.attributes.position.needsUpdate = true;
        points.rotation.y =
          (motionRef.current ? Math.sin(time * 0.7) * 0.025 : 0) +
          progress * 0.12;
        points.rotation.x = progress * -0.08;
        points.scale.setScalar(1 - progress * 0.09);
        if (material)
          material.opacity = Math.max(
            0,
            Math.min(0.92, (progress - 0.035) * 1.5),
          );
      }
      renderer.render(scene, camera);
    };
    onResize();
    frame = requestAnimationFrame(animate);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      geometry?.dispose();
      material?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  return <div ref={hostRef} className="particle-canvas" aria-hidden="true" />;
}

const projects = [
  {
    n: "01",
    title: "Sunstone Bhopal Dashboard",
    type: "Campus information platform",
    desc: "A campus-focused web experience designed to bring student resources, campus updates, events, and useful information into one place.",
    stack: "HTML · CSS · JavaScript",
    href: "https://github.com/TusharSingour/Sunstone-Bhopal-Dashboard",
    visual: "campus",
    status: "Repository",
  },
  {
    n: "02",
    title: "Sunstone Builders 2.0",
    type: "Student developer platform · Concept",
    desc: "A platform concept for hackathon team formation, coding support, verified learning streaks, and sharing student projects. Presented as a concept, not a launched product.",
    stack: "Product design · Web development",
    href: links.github,
    visual: "builder",
    status: "Concept",
  },
  {
    n: "03",
    title: "Hotel Booking Website",
    type: "Hospitality web experience",
    desc: "A hotel website project focused on presenting rooms and a clear booking journey. Payment, live availability, and backend booking claims are intentionally not assumed.",
    stack: "HTML · CSS · JavaScript",
    href: links.github,
    visual: "hotel",
    status: "Project",
  },
  {
    n: "04",
    title: "Telegram AI Chatbot",
    type: "AI assistant · Workflow project",
    desc: "An AI chatbot workflow concept for responding to Telegram messages. External model access and deployment depend on valid API credentials and configuration.",
    stack: "Telegram · n8n · AI API",
    href: links.github,
    visual: "telegram",
    status: "Integration project",
  },
  {
    n: "05",
    title: "Expense Tracker",
    type: "Personal finance · In progress",
    desc: "A focused expense-tracking project for organizing everyday spending. Authentication, persistence, and analytics are only claimed once implemented and verified.",
    stack: "HTML · CSS · JavaScript",
    href: links.github,
    visual: "finance",
    status: "In progress",
  },
  {
    n: "06",
    title: "Mandla Explore",
    type: "Local discovery concept",
    desc: "A web concept centered on exploring Mandla and presenting local places in a simple, accessible format.",
    stack: "Web development",
    href: links.github,
    visual: "explore",
    status: "Concept",
  },
];
const skills = [
  {
    title: "Frontend",
    items: "HTML · CSS · JavaScript",
    icon: Layers3,
    state: "Building",
  },
  {
    title: "Programming",
    items: "C · Python basics · Java / C++",
    icon: Terminal,
    state: "Learning",
  },
  {
    title: "MERN stack",
    items: "MongoDB · Express · React · Node.js",
    icon: Code2,
    state: "Currently learning",
  },
  {
    title: "Tools & AI workflows",
    items: "Git · GitHub · VS Code · n8n · AI tools",
    icon: Sparkles,
    state: "Using & exploring",
  },
];
const certificates = [
  {
    title: "AI Assistant Bootcamp",
    issuer: "Vedam School of Technology",
    date: "July 2026",
    detail: "AI assistant tools and workflows",
  },
  {
    title: "Web Development CodeSprint",
    issuer: "Vedam School of Technology",
    date: "July 2026",
    detail: "Certificate of completion",
  },
  {
    title: "Introduction to Programming",
    issuer: "Vedam School of Technology · CodeSprint",
    date: "July 2026",
    detail: "Programming fundamentals",
  },
  {
    title: "Claude 101",
    issuer: "Anthropic",
    date: "May 2026",
    detail: "Introduction to Claude",
  },
  {
    title: "Hour of AI Basics",
    issuer: "Code.org Foundation",
    date: "April 2026",
    detail: "AI basics and prompt engineering",
  },
  {
    title: "Cursor AI: VibeCode Mastery",
    issuer: "Sunstone",
    date: "February 2026",
    detail: "AI-assisted coding and debugging",
  },
  {
    title: "AI Tools Workshop",
    issuer: "Be10x",
    date: "April 2026",
    detail: "AI tools for analysis and development",
  },
  {
    title: "Introduction to Data Science and AI",
    issuer: "Indian Institute of Technology Madras",
    date: "August 2025",
    detail: "Data science and AI foundations",
  },
];

export default function Home() {
  const [motionOn, setMotionOn] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activePerspective, setActivePerspective] = useState<
    "Build" | "Learn" | "Connect"
  >("Build");
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const elements = gsap.utils.toArray<HTMLElement>(".reveal-up");
    if (
      !motionOn ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      gsap.set(elements, { clearProps: "all", autoAlpha: 1, y: 0 });
      return;
    }
    const ctx = gsap.context(() => {
      elements.forEach((element) => {
        gsap.fromTo(
          element,
          { y: 34, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: { trigger: element, start: "top 88%", once: true },
          },
        );
      });
    });
    return () => ctx.revert();
  }, [motionOn]);
  useEffect(() => {
    document.documentElement.classList.toggle("motion-off", !motionOn);
    return () => document.documentElement.classList.remove("motion-off");
  }, [motionOn]);
  const closeMenu = () => setMenuOpen(false);
  return (
    <main>
      <header className={`nav ${scrolled ? "nav-scrolled" : ""}`}>
        <a className="brand" href="#home" aria-label="Tushar Singour home">
          <span className="brand-mark">t.</span>
          <span>TUSHAR SINGOUR</span>
        </a>
        <nav
          className={menuOpen ? "nav-links nav-open" : "nav-links"}
          aria-label="Main navigation"
        >
          {[
            ["About", "#about"],
            ["Selected work", "#work"],
            ["Stack", "#stack"],
            ["Certificates", "#certificates"],
            ["Journey", "#journey"],
            ["Contact", "#contact"],
          ].map(([label, href]) => (
            <a key={label} href={href} onClick={closeMenu}>
              {label}
            </a>
          ))}
        </nav>
        <div className="nav-actions">
          <button
            className="motion-toggle"
            onClick={() => setMotionOn((v) => !v)}
            aria-label={motionOn ? "Turn animations off" : "Turn animations on"}
            title={motionOn ? "Motion on" : "Motion off"}
          >
            {motionOn ? <Sun size={15} /> : <Moon size={15} />}
            <span>Motion {motionOn ? "on" : "off"}</span>
          </button>
          <a className="nav-cta" href="#contact">
            Let’s talk <ArrowUpRight size={15} />
          </a>
          <button
            className="menu-toggle"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <div className="hero-scroll-wrap">
        <section className="hero" id="home">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-kicker">
            <span className="status-dot" /> B.TECH CSE · SAGE UNIVERSITY BHOPAL
          </div>
          <div className="hero-side-note">
            <span>01 / PRESENCE</span>
            <span>
              ENGINEERING
              <br />
              EDUCATION
              <br />
              HUMAN CONNECTION
            </span>
          </div>
          <div className="hero-portrait">
            <Image
              src="/images/profile/tushar-singour-studio.png"
              alt="Tushar Singour, with warm amber side lighting against a dark background"
              fill
              priority
              sizes="(max-width: 700px) 90vw, 42vw"
            />
          </div>
          <ParticlePortrait motionOn={motionOn} />
          <div className="hero-content">
            <p className="eyebrow hero-eyebrow">
              A HUMAN PERSPECTIVE ON TECHNOLOGY
            </p>
            <h1>
              <span>Tushar</span> <em>Singour</em>
            </h1>
            <p className="hero-description">
              I build practical web experiences, explore backend systems, and
              turn ideas into working projects.
            </p>
            <div className="hero-buttons">
              <a className="button button-light" href="#work">
                Explore my work <ArrowDown size={16} />
              </a>
              <a className="text-link" href="#contact">
                Start a conversation <ArrowUpRight size={17} />
              </a>
            </div>
          </div>
          <div className="hero-bottom">
            <span>
              SCROLL TO DISCOVER <ArrowDown size={14} />
            </span>
            <span>FULL STACK DEVELOPMENT · JAVA · DSA</span>
            <span>BHOPAL, INDIA</span>
          </div>
        </section>
      </div>

      <section className="proof-strip" aria-label="Portfolio overview">
        <div className="proof-item reveal-up">
          <span className="proof-number">
            01<span>/</span>
          </span>
          <p>Degree in progress</p>
          <small>B.Tech Computer Science</small>
        </div>
        <div className="proof-item reveal-up">
          <span className="proof-number">
            02<span>/</span>
          </span>
          <p>Core focus areas</p>
          <small>Full Stack · Java · DSA</small>
        </div>
        <div className="proof-item reveal-up">
          <span className="proof-number">
            03<span>/</span>
          </span>
          <p>Featured explorations</p>
          <small>Projects, code, learning</small>
        </div>
        <a className="proof-link reveal-up" href="#work">
          THE WORK.
          <br />
          THE LEARNING. <ArrowUpRight size={16} />
        </a>
      </section>

      <section className="intro-strip" id="about">
        <div className="intro-label">
          A LITTLE ABOUT ME <span>↘</span>
        </div>
        <div className="intro-copy reveal-up">
          <p className="section-kicker">
            CURIOUS BY NATURE. BUILDER BY PRACTICE.
          </p>
          <h2>
            I’m learning to turn <span>curiosity into code</span> — one project,
            one bug, one better version at a time.
          </h2>
          <div className="intro-foot">
            <p>
              B.Tech Computer Science & Engineering student at SAGE University
              Bhopal, powered by Sunstone. My focus is full-stack development,
              Java, data structures, and practical software projects.
            </p>
            <a
              href="#journey"
              className="circle-link"
              aria-label="Explore my journey"
            >
              <ArrowDownRight size={21} />
            </a>
          </div>
        </div>
      </section>

      <section
        className="perspective-section section-pad"
        aria-label="How I approach technology"
      >
        <div className="perspective-top">
          <p className="section-kicker">01 / THE PERSON BEHIND THE WORK</p>
          <span>A CONNECTED PERSPECTIVE</span>
        </div>
        <div className="perspective-main">
          <div
            className={`perspective-art perspective-${activePerspective.toLowerCase()} reveal-up`}
            aria-hidden="true"
          >
            <div className="discipline-panel">
              <div className="discipline-panel-top">
                <span>TS / FIELD NOTES</span>
                <span>
                  0
                  {activePerspective === "Build"
                    ? "1"
                    : activePerspective === "Learn"
                      ? "2"
                      : "3"}
                </span>
              </div>
              {activePerspective === "Build" ? (
                <>
                  <div className="build-diagram">
                    <span className="diagram-node">IDEA</span>
                    <i />
                    <span className="diagram-node diagram-node-main">
                      BUILD
                    </span>
                    <i />
                    <span className="diagram-node">SHIP</span>
                  </div>
                  <div className="discipline-lines">
                    <i />
                    <i />
                    <i />
                  </div>
                  <span className="discipline-caption">
                    FROM CONCEPT TO INTERFACE
                  </span>
                </>
              ) : activePerspective === "Learn" ? (
                <>
                  <div className="learning-stack">
                    <span>01&nbsp; FUNDAMENTALS</span>
                    <span>02&nbsp; PRACTICE</span>
                    <span>03&nbsp; PROJECTS</span>
                    <span>04&nbsp; REVIEW & IMPROVE</span>
                  </div>
                  <span className="discipline-caption">
                    SMALL STEPS. REAL PROGRESS.
                  </span>
                </>
              ) : (
                <>
                  <div className="connect-orbit">
                    <span>USER</span>
                    <i />
                    <span>IDEA</span>
                    <i />
                    <span>TEAM</span>
                  </div>
                  <div className="discipline-lines">
                    <i />
                    <i />
                  </div>
                  <span className="discipline-caption">
                    TECHNOLOGY FOR PEOPLE
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="perspective-copy reveal-up">
            <p className="section-kicker">
              THREE DISCIPLINES. ONE PERSPECTIVE.
            </p>
            <h2>
              {activePerspective === "Build" ? (
                <>
                  Give an idea <em>structure.</em>
                </>
              ) : activePerspective === "Learn" ? (
                <>
                  Make complexity <em>click.</em>
                </>
              ) : (
                <>
                  Build things <em>with people.</em>
                </>
              )}
            </h2>
            <p>
              {activePerspective === "Build"
                ? "I turn ideas into interfaces and practical web projects, learning how thoughtful engineering connects a real need to a working experience."
                : activePerspective === "Learn"
                  ? "I strengthen fundamentals through coursework, debugging, Java practice, and breaking difficult concepts into smaller steps I can understand."
                  : "I value clear communication, useful feedback, and collaborative problem-solving. Technology matters most when it helps someone do something better."}
            </p>
            <div
              className="perspective-tabs"
              role="group"
              aria-label="Choose a perspective"
            >
              {(["Build", "Learn", "Connect"] as const).map((item) => (
                <button
                  key={item}
                  className={
                    activePerspective === item
                      ? "perspective-tab active"
                      : "perspective-tab"
                  }
                  onClick={() => setActivePerspective(item)}
                  aria-pressed={activePerspective === item}
                >
                  {item}
                  <ArrowUpRight size={13} />
                </button>
              ))}
            </div>
            <small>CHOOSE A PERSPECTIVE TO EXPLORE.</small>
          </div>
        </div>
      </section>

      <section className="work-section section-pad" id="work">
        <div className="section-heading reveal-up">
          <div>
            <p className="section-kicker">02 / SELECTED WORK</p>
            <h2>
              Things I’ve <em>been building.</em>
            </h2>
          </div>
          <p className="section-note">
            A small selection of projects and experiments. Details are kept
            honest; unfinished ideas stay labelled as such.
          </p>
        </div>
        <div className="project-list">
          {projects.map((p) => (
            <article
              className={`project-row project-${p.visual} reveal-up`}
              key={p.n}
            >
              <div className="project-visual">
                <div className="visual-top">
                  <span>PROJECT / {p.n}</span>
                  <span>↗</span>
                </div>
                {p.visual === "campus" ? (
                  <div className="campus-art">
                    <div className="campus-orb" />
                    <div className="campus-panel">
                      <span>SAGE / SUNSTONE</span>
                      <strong>
                        Campus
                        <br />
                        Dashboard
                      </strong>
                      <i>STUDENT RESOURCES — BPL</i>
                    </div>
                    <div className="art-lines" />
                  </div>
                ) : p.visual === "builder" ? (
                  <div className="builder-art">
                    <span className="mini-label">SUNSTONE / BUILDERS 2.0</span>
                    <strong>
                      Build
                      <br />
                      <em>together.</em>
                    </strong>
                    <div className="builder-cards">
                      <i>HACKATHONS ↗</i>
                      <i>CODING HELP ↗</i>
                      <i>PROJECTS ↗</i>
                    </div>
                    <div className="builder-grid" />
                  </div>
                ) : p.visual === "hotel" ? (
                  <div className="hotel-art">
                    <span className="mini-label">
                      HOSPITALITY / WEB EXPERIENCE
                    </span>
                    <div className="hotel-window">
                      <span>STAY / DISCOVER</span>
                      <strong>
                        A place
                        <br />
                        to <em>unwind.</em>
                      </strong>
                      <i>ROOMS · DETAILS · BOOKING JOURNEY</i>
                    </div>
                    <div className="hotel-sun" />
                  </div>
                ) : p.visual === "telegram" ? (
                  <div className="telegram-art">
                    <span className="mini-label">TELEGRAM / AI ASSISTANT</span>
                    <div className="chat-bubble chat-bubble-user">
                      Can you help me?
                    </div>
                    <div className="chat-bubble chat-bubble-ai">
                      <b>AI ASSISTANT</b>
                      <span>
                        Sure — let&apos;s work through it step by step.
                      </span>
                    </div>
                    <div className="telegram-orbit">AI</div>
                  </div>
                ) : p.visual === "finance" ? (
                  <div className="finance-art">
                    <span className="finance-label">SPENDING OVERVIEW</span>
                    <strong>
                      ₹ <b>••••</b>
                    </strong>
                    <div className="bars">
                      {[36, 54, 43, 72, 48, 88, 62, 78, 49, 95, 66, 82].map(
                        (h, i) => (
                          <i key={i} style={{ height: `${h}%` }} />
                        ),
                      )}
                    </div>
                    <span className="finance-bottom">
                      A CONCEPT IN PROGRESS
                    </span>
                  </div>
                ) : (
                  <div className="explore-art">
                    <span>DISCOVER / 01</span>
                    <strong>
                      Explore
                      <br />
                      <em>Mandla.</em>
                    </strong>
                    <div className="explore-sun" />
                    <div className="explore-hills" />
                  </div>
                )}
              </div>
              <div className="project-info">
                <div className="project-type">{p.type}</div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
                <div className="project-stack">
                  {p.stack.split(" · ").map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </div>
                <span className="project-status">STATUS / {p.status}</span>
                <a
                  href={p.href}
                  target="_blank"
                  rel="noreferrer"
                  className="project-link"
                >
                  {p.n === "01"
                    ? "View repository"
                    : "View related GitHub work"}{" "}
                  <MoveUpRight size={15} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="stack-section section-pad" id="stack">
        <div className="section-heading reveal-up">
          <div>
            <p className="section-kicker">03 / THE TOOLKIT</p>
            <h2>
              Learning in <em>layers.</em>
            </h2>
          </div>
          <p className="section-note">
            Not a list of percentages. Just an honest snapshot of what I use,
            what I’m learning, and what’s next.
          </p>
        </div>
        <div className="skill-grid">
          {skills.map((s, i) => (
            <article className="skill-card reveal-up" key={s.title}>
              <div className="skill-card-top">
                <span>0{i + 1}</span>
                <s.icon size={21} strokeWidth={1.5} />
              </div>
              <h3>{s.title}</h3>
              <p>{s.items}</p>
              <span className="skill-state">
                <i /> {s.state}
              </span>
            </article>
          ))}
        </div>
        <div className="stack-note">
          <span className="stack-note-mark">↗</span>
          <p>
            My rule: understand the fundamentals, build something real, debug
            it, and improve it. Tools are useful when they help me think and
            ship better.
          </p>
        </div>
      </section>

      <section className="certificates-section section-pad" id="certificates">
        <div className="section-heading reveal-up">
          <div>
            <p className="section-kicker">
              04 / CERTIFICATES & CONTINUOUS LEARNING
            </p>
            <h2>
              Learning that <em>leaves a trace.</em>
            </h2>
          </div>
          <p className="section-note">
            Credentials shown from the certificate list you shared. Open the
            original credential on its issuing platform to verify details.
          </p>
        </div>
        <div className="certificate-grid">
          {certificates.map((c, i) => (
            <article className="certificate-card reveal-up" key={c.title}>
              <div className="certificate-top">
                <span>0{i + 1}</span>
                <span className="certificate-mark">✳</span>
              </div>
              <h3>{c.title}</h3>
              <p>{c.issuer}</p>
              <div className="certificate-bottom">
                <span>{c.detail}</span>
                <time>{c.date}</time>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="journey-section section-pad" id="journey">
        <div className="journey-left reveal-up">
          <p className="section-kicker">05 / THE JOURNEY</p>
          <h2>
            Progress over <em>pretence.</em>
          </h2>
          <p className="journey-lead">
            The goal isn’t to look like I know everything. It’s to keep getting
            better at the things that matter.
          </p>
          <a
            href={links.leetcode}
            target="_blank"
            rel="noreferrer"
            className="button button-outline"
          >
            My LeetCode profile <ArrowUpRight size={16} />
          </a>
        </div>
        <div className="timeline">
          <div className="timeline-item reveal-up">
            <span className="timeline-no">01</span>
            <div>
              <span className="timeline-status">CURRENT CHAPTER</span>
              <h3>B.Tech CSE</h3>
              <p>SAGE University Bhopal · powered by Sunstone</p>
              <small>
                Computer Science & Engineering · Data Analytics specialization
              </small>
            </div>
          </div>
          <div className="timeline-item reveal-up">
            <span className="timeline-no">02</span>
            <div>
              <span className="timeline-status">BUILDING FOUNDATIONS</span>
              <h3>DSA with JavaScript & MERN Stack </h3>
              <p>
                Strengthening programming fundamentals and practicing
                problem-solving.
              </p>
            </div>
          </div>
          <div className="timeline-item reveal-up">
            <span className="timeline-no">03</span>
            <div>
              <span className="timeline-status">NEXT UP</span>
              <h3>  Full-stack Web Development</h3>
              <p>
                Learning MongoDB, Express, React, and Node.js while building
                toward stronger APIs, databases, and deployable projects.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="contact-inner reveal-up">
          <div className="contact-orbit" aria-hidden="true" />
          <p className="section-kicker">06 / YOUR TURN</p>
          <h2>
            Have a good idea?
            <br />
            <em>Let’s make it real.</em>
          </h2>
          <p className="contact-copy">
            I’m always interested in thoughtful conversations about technology,
            building projects, and learning from people who care about their
            craft.
          </p>
          <a
            className="button button-light contact-button"
            href={links.linkedin}
            target="_blank"
            rel="noreferrer"
          >
            Connect on LinkedIn <ArrowUpRight size={17} />
          </a>
          <div className="social-links">
            <a href={links.github} target="_blank" rel="noreferrer">
              <Github size={17} /> GitHub <ExternalLink size={12} />
            </a>
            <a href={links.linkedin} target="_blank" rel="noreferrer">
              <Linkedin size={17} /> LinkedIn <ExternalLink size={12} />
            </a>
            <a href={links.leetcode} target="_blank" rel="noreferrer">
              <Code2 size={17} /> LeetCode <ExternalLink size={12} />
            </a>
            <a href={links.codechef} target="_blank" rel="noreferrer">
              CodeChef <ExternalLink size={12} />
            </a>
            <a href={links.instagram} target="_blank" rel="noreferrer">
              Instagram <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <a className="brand" href="#home">
          <span className="brand-mark">t.</span>
          <span>TUSHAR SINGOUR</span>
        </a>
        <span>BUILT WITH CURIOSITY & CARE.</span>
        <a href="#home" className="back-top">
          BACK TO TOP ↑
        </a>
        <span>© {new Date().getFullYear()} TUSHAR SINGOUR</span>
      </footer>
    </main>
  );
}
