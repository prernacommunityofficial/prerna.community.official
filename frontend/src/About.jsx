import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown, ArrowRight, ArrowUpRight, BrainCircuit, BriefcaseBusiness, Check,
  Code2, Compass, FlaskConical, GraduationCap, Handshake, Heart, HeartPulse,
  Landmark, Lightbulb, MessageCircle, PenTool, Rocket, Search, ShieldCheck,
  Sprout, Store, Target, TestTube, Users, Workflow
} from 'lucide-react';
import './About.css';

const values = [
  { icon: Lightbulb, title: 'Innovation', text: 'We encourage fresh thinking and creative approaches to real-world challenges.', tone: 'gold' },
  { icon: Handshake, title: 'Collaboration', text: 'We believe diverse minds create stronger solutions when they work together.', tone: 'pink' },
  { icon: GraduationCap, title: 'Learning', text: 'Every challenge is an opportunity to explore, experiment and grow.', tone: 'lavender' },
  { icon: Heart, title: 'Inclusivity', text: 'Every individual and every idea deserves an opportunity to be heard.', tone: 'pink' },
  { icon: Target, title: 'Real-world impact', text: 'We focus on meaningful problems and practical solutions.', tone: 'gold' },
  { icon: ShieldCheck, title: 'Ownership', text: 'We encourage responsibility, shared contribution and collective success.', tone: 'lavender' }
];

const journey = [
  { title: 'Discover', text: 'Observe everyday challenges and identify genuine problems.', icon: Compass },
  { title: 'Research', text: 'Talk to people, understand their needs and validate the problem.', icon: Search },
  { title: 'Ideate', text: 'Brainstorm creative approaches and explore possible solutions.', icon: Lightbulb },
  { title: 'Build', text: 'Develop practical products using modern technologies.', icon: Code2 },
  { title: 'Test', text: 'Collect feedback, improve usability and validate results.', icon: TestTube },
  { title: 'Impact', text: 'Work towards delivering useful solutions to real users.', icon: Rocket }
];

const domains = [
  { icon: BrainCircuit, title: 'Artificial Intelligence & Machine Learning' },
  { icon: GraduationCap, title: 'Education Technology' },
  { icon: HeartPulse, title: 'Healthcare Innovation' },
  { icon: Sprout, title: 'Agriculture Technology' },
  { icon: Landmark, title: 'Banking & Finance' },
  { icon: Store, title: 'Small Business Solutions' },
  { icon: Users, title: 'Social Innovation' },
  { icon: Workflow, title: 'Productivity & Automation' }
];

const teams = [
  { icon: BrainCircuit, title: 'AI & Backend Development' },
  { icon: PenTool, title: 'Frontend & UI/UX' },
  { icon: FlaskConical, title: 'Data & Research' },
  { icon: Check, title: 'Testing & Deployment' },
  { icon: MessageCircle, title: 'Marketing & Communication' },
  { icon: BriefcaseBusiness, title: 'Content & Documentation' }
];

function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(() => typeof window === 'undefined'
    || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    || !('IntersectionObserver' in window));
  useEffect(() => {
    if (visible) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.18 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [visible]);
  return <div ref={ref} className={`about-reveal${visible ? ' is-visible' : ''}${className ? ` ${className}` : ''}`} style={{ '--reveal-delay': `${delay}s` }}>{children}</div>;
}

function SectionHeading({ eyebrow, title, text, centered = false, id }) {
  return <div className={`about-heading${centered ? ' about-heading-centered' : ''}`}>
    <span className="about-eyebrow">{eyebrow}</span>
    <h2 id={id}>{title}</h2>
    {text && <p>{text}</p>}
  </div>;
}

export default function About() {
  const [activeStep, setActiveStep] = useState(0);
  const ActiveStepIcon = journey[activeStep].icon;

  useEffect(() => {
    const previousTitle = document.title;
    const description = document.querySelector('meta[name="description"]');
    const previousDescription = description?.getAttribute('content');
    document.title = 'About PRERNA — The Innovation Collective';
    description?.setAttribute('content', 'Meet PRERNA — The Innovation Collective. Discover our mission, values, innovation journey, and the people-first ideas behind our work.');
    return () => {
      document.title = previousTitle;
      if (previousDescription !== null) description?.setAttribute('content', previousDescription);
    };
  }, []);

  return <div className="about-page">
    <section className="about-hero" aria-labelledby="about-title">
      <div className="about-hero-orb about-hero-orb-one" />
      <div className="about-hero-orb about-hero-orb-two" />
      <div className="container about-hero-grid">
        <div className="about-hero-copy">
          <span className="about-eyebrow"><i /> Get to know PRERNA</span>
          <h1 id="about-title">Where ideas meet <span>innovation,</span> and innovation creates impact.</h1>
          <p>Prerna – The Innovation Collective is a student-driven community bringing together curious minds, creative thinkers and technology enthusiasts to identify real-world challenges and develop meaningful solutions through collaboration, research and innovation.</p>
          <p className="about-tagline">Inspiring Ideas. Creating Impact.</p>
          <div className="about-hero-actions">
            <Link className="btn btn-primary" to="/projects">Explore our projects <ArrowRight size={17} /></Link>
            <Link className="btn btn-secondary" to="/team">Meet our community <ArrowUpRight size={16} /></Link>
          </div>
          <a className="about-scroll-link" href="#our-story"><span>Discover our story</span><ArrowDown size={15} /></a>
        </div>
        <div className="about-hero-art" role="img" aria-label="PRERNA illustration representing curiosity and new ideas">
          <div className="about-art-wash" />
          <div className="about-art-ring about-art-ring-one" />
          <div className="about-art-ring about-art-ring-two" />
          <div className="about-art-spark about-art-spark-one">✳</div>
          <div className="about-art-spark about-art-spark-two">✦</div>
          <img className="about-hero-logo" src="/logo.png" alt="" />
          <div className="about-art-note about-art-note-top"><Lightbulb size={17} /><span>Start with a question</span></div>
          <div className="about-art-note about-art-note-bottom"><Users size={17} /><span>Make it together</span></div>
          <span className="about-art-caption">CURIOUS MINDS · SHARED PURPOSE</span>
        </div>
      </div>
    </section>

    <section className="about-story section" id="our-story" aria-labelledby="story-title">
      <div className="container about-story-grid">
        <Reveal className="about-story-copy">
          <span className="about-eyebrow">01 / Our story</span>
          <h2 id="story-title">Every great innovation begins with a <em>question.</em></h2>
          <p>Prerna was created with a simple belief: meaningful innovation begins when people come together to solve real problems.</p>
          <p>We are building a collaborative environment where students from different backgrounds can share ideas, explore challenges, learn new technologies and turn their thinking into practical solutions.</p>
          <p>Our focus is not just on building software. It is about understanding people, identifying genuine needs and creating technology that makes a difference.</p>
          <Link className="about-inline-link" to="/problems">Explore the problem lab <ArrowRight size={16} /></Link>
        </Reveal>
        <Reveal className="about-story-visual" delay={0.12}>
          <div className="story-orbit story-orbit-one" />
          <div className="story-orbit story-orbit-two" />
          <div className="story-center"><img src="/logo.png" alt="PRERNA" /><span>Ideas start<br />with people.</span></div>
          <div className="story-node story-node-one"><MessageCircle size={20} /><span>Listen</span></div>
          <div className="story-node story-node-two"><Search size={20} /><span>Understand</span></div>
          <div className="story-node story-node-three"><Lightbulb size={20} /><span>Imagine</span></div>
          <div className="story-side-note"><span className="story-side-line" />People first. Always.</div>
        </Reveal>
      </div>
    </section>

    <section className="about-purpose section section-soft" aria-label="Our mission and vision">
      <div className="container">
        <Reveal className="about-purpose-grid">
          <article className="purpose-mission">
            <div className="purpose-icon"><Target size={23} /></div>
            <span className="about-eyebrow">02 / Our mission</span>
            <h2>Our Mission</h2>
            <h3>Make room for ideas that matter.</h3>
            <p>To bring students together and empower them to identify real-world problems, collaborate across disciplines and develop practical, technology-driven solutions that create meaningful impact.</p>
            <div className="purpose-decoration"><span /><span /><span /></div>
          </article>
          <article className="purpose-vision">
            <div className="vision-glow" />
            <div className="purpose-icon"><Lightbulb size={23} /></div>
            <span className="about-eyebrow">03 / Our vision</span>
            <h2>Our Vision</h2>
            <h3>A future shaped by curious, confident creators.</h3>
            <p>To build an inclusive innovation ecosystem where ideas have the opportunity to grow into impactful solutions and students become confident creators, problem-solvers and future innovators.</p>
            <span className="vision-mark" aria-hidden="true">P</span>
          </article>
        </Reveal>
      </div>
    </section>

    <section className="about-values section" aria-labelledby="values-title">
      <div className="container">
        <Reveal><SectionHeading id="values-title" eyebrow="04 / What we believe in" title="The values that drive us." text="These are more than words on a page. They shape how we listen, build, and learn together." /></Reveal>
        <div className="about-values-grid">
          {values.map(({ icon: Icon, title, text, tone }, index) => <Reveal className="about-value-wrap" delay={(index % 3) * 0.06} key={title}>
            <article className="about-value">
              <span className={`about-value-icon ${tone}`}><Icon size={20} strokeWidth={1.8} /></span>
              <span className="about-value-number">0{index + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
              <span className="about-value-rule" />
            </article>
          </Reveal>)}
        </div>
      </div>
    </section>

    <section className="about-journey section section-soft" aria-labelledby="journey-title">
      <div className="container">
        <Reveal><SectionHeading id="journey-title" eyebrow="05 / How we work" title="From problems to possibilities." text="A thoughtful process keeps people at the center—from the first question to the work that follows." /></Reveal>
        <div className="journey-layout">
          <div className="journey-steps" role="group" aria-label="Innovation journey steps">
            {journey.map(({ title }, index) => <button
              className={`journey-step${activeStep === index ? ' active' : ''}`}
              type="button"
              key={title}
              onClick={() => setActiveStep(index)}
              aria-pressed={activeStep === index}
            >
              <span className="journey-step-number">0{index + 1}</span>
              <span className="journey-step-title">{title}</span>
              <span className="journey-step-indicator" />
            </button>)}
          </div>
          <div className="journey-detail" aria-live="polite">
            <div className="journey-detail-top"><span>THE JOURNEY</span><span>0{activeStep + 1} <i>/</i> 06</span></div>
            <div className="journey-detail-icon"><ActiveStepIcon size={25} strokeWidth={1.7} /></div>
            <h3>{journey[activeStep].title}</h3>
            <p>{journey[activeStep].text}</p>
            <div className="journey-progress" aria-hidden="true"><span style={{ width: `${((activeStep + 1) / journey.length) * 100}%` }} /></div>
            <div className="journey-controls">
              <span>Choose a step to explore</span>
              <button type="button" aria-label="Next journey step" onClick={() => setActiveStep((activeStep + 1) % journey.length)}><ArrowRight size={17} /></button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="about-domains section" aria-labelledby="domains-title">
      <div className="container">
        <Reveal><SectionHeading id="domains-title" eyebrow="06 / Where we explore" title="Ideas across different domains." text="We explore challenges in many areas. These are directions for discovery—not claims about completed projects." /></Reveal>
        <div className="about-domains-grid">
          {domains.map(({ icon: Icon, title }, index) => <Reveal className="about-domain-wrap" delay={(index % 4) * 0.04} key={title}>
            <article className="about-domain"><span className={`domain-icon domain-tone-${index % 4}`}><Icon size={21} strokeWidth={1.7} /></span><h3>{title}</h3><ArrowUpRight size={16} className="domain-arrow" aria-hidden="true" /></article>
          </Reveal>)}
        </div>
      </div>
    </section>

    <section className="about-collective section section-soft" aria-labelledby="collective-title">
      <div className="container about-collective-grid">
        <Reveal className="collective-copy">
          <span className="about-eyebrow">07 / Our collective</span>
          <h2 id="collective-title">Different skills.<br /><em>One shared purpose.</em></h2>
          <p>Prerna brings together students with different skills, interests and perspectives. From technology and design to research, communication and business thinking, everyone has something valuable to contribute.</p>
          <Link className="btn btn-primary" to="/team">Meet our team <ArrowRight size={17} /></Link>
        </Reveal>
        <Reveal className="collective-teams" delay={0.1}>
          <div className="collective-teams-heading"><span>Many ways to contribute</span><span>01 — 06</span></div>
          {teams.map(({ icon: Icon, title }, index) => <div className="collective-team" key={title}><span className="collective-team-icon"><Icon size={18} /></span><span>{title}</span><span className="collective-team-number">0{index + 1}</span></div>)}
        </Reveal>
      </div>
    </section>

    <section className="about-philosophy" aria-label="Our philosophy">
      <div className="philosophy-decoration philosophy-decoration-left">“</div>
      <div className="container philosophy-inner">
        <Reveal>
          <span className="about-eyebrow">08 / Our philosophy</span>
          <blockquote>An idea becomes powerful when people come together to <em>make it real.</em></blockquote>
          <p>We are not here just to discuss possibilities. We are here to explore, experiment, build and learn together.</p>
        </Reveal>
      </div>
      <div className="philosophy-decoration philosophy-decoration-right" aria-hidden="true"><span /><span /><span /></div>
    </section>

    <section className="about-join section" aria-labelledby="join-title">
      <div className="container">
        <Reveal className="about-join-panel">
          <div className="join-panel-copy">
            <span className="about-eyebrow">09 / Join our journey</span>
            <h2 id="join-title">Have an idea? Let’s build something meaningful together.</h2>
            <p>Whether you are a student, researcher, designer, developer or someone who loves solving problems, there is a place for you in our innovation journey.</p>
            <div className="about-join-actions">
              <Link className="btn btn-primary" to="/join">Join PRERNA <ArrowRight size={17} /></Link>
              <Link className="about-inline-link" to="/projects">Explore projects <ArrowRight size={16} /></Link>
            </div>
          </div>
          <div className="join-panel-art" aria-hidden="true">
            <div className="join-art-orbit join-art-orbit-one" /><div className="join-art-orbit join-art-orbit-two" />
            <div className="join-art-core"><img src="/logo.png" alt="" /></div>
            <span className="join-art-dot join-art-dot-one" /><span className="join-art-dot join-art-dot-two" /><span className="join-art-dot join-art-dot-three" />
          </div>
        </Reveal>
      </div>
    </section>
  </div>;
}
