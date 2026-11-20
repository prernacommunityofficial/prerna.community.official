import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, BrainCircuit, BriefcaseBusiness, Check, ChevronDown,
  Code2, ExternalLink, HeartPulse, Leaf, Link2, Menu, Search, Send, Sparkles, Users, X
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const About = lazy(() => import('./About.jsx'));
const api = axios.create({ baseURL: API, timeout: 15000 });
const assetUrl = path => path ? `${API.replace(/\/api\/?$/, '')}${path}` : '';
const CURRENT_YEAR = new Date().getFullYear();
const EMPTY_LIST = [];
const EMPTY_OBJECT = {};
const COMMUNITY_TOKEN_KEY = 'prerna_community_token';
const COMMUNITY_USER_KEY = 'prerna_community_user';
const getCommunityToken = () => localStorage.getItem(COMMUNITY_TOKEN_KEY);
const getCommunityUser = () => {
  try { return JSON.parse(localStorage.getItem(COMMUNITY_USER_KEY) || 'null'); } catch { return null; }
};

function Logo() {
  return <Link className="brand" to="/" aria-label="PRERNA home">
    <span className="brand-mark"><img src="/logo.png" alt="" /></span>
  </Link>;
}

function Nav() {
  const [open, setOpen] = useState(false);
  const user = getCommunityUser();
  const links = [
    ['/', 'Home'], ['/about', 'About'], ['/projects', 'Projects'],
    ['/team', 'Team'], ['/problems', 'Problems'], ['/contact', 'Contact']
  ];
  return <header className="nav-shell">
    <nav className="nav container" aria-label="Main navigation">
      <Logo />
      <button className="nav-toggle" onClick={() => setOpen(value => !value)} aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open}>
        {open ? <X size={21} /> : <Menu size={21} />}
      </button>
      <div className={`nav-links ${open ? 'open' : ''}`}>
        {links.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)}>{label}</NavLink>)}
      </div>
      <Link className="btn btn-primary nav-cta" to={user ? '/profile' : '/join'}>{user ? 'My profile' : 'Join Prerna'} <ArrowRight size={16} /></Link>
    </nav>
  </header>;
}

function Footer() {
  return <footer className="site-footer">
    <div className="container footer-grid">
      <div className="footer-brand"><Logo /><p>Ideas into innovation.<br />Together, with purpose.</p></div>
      <div><h4>Discover</h4><Link to="/about">About Prerna</Link><Link to="/projects">Our projects</Link><Link to="/team">Meet the team</Link></div>
      <div><h4>Get involved</h4><Link to="/problems">Problem lab</Link><Link to="/problems/submit">Share a problem</Link><Link to="/join">Join the collective</Link></div>
      <div><h4>Say hello</h4><Link to="/contact">Contact us</Link><a href="mailto:hello@prerna.org">hello@prerna.org</a></div>
    </div>
    <div className="footer-bottom container"><span>© {CURRENT_YEAR} PRERNA – The Innovation Collective</span><div className="footer-legal"><Link to="/terms">Terms &amp; Conditions</Link><Link to="/privacy-policy">Privacy Policy</Link></div></div>
  </footer>;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

function SectionTitle({ eyebrow, title, text, align = 'left' }) {
  return <div className={`section-heading ${align === 'center' ? 'text-center' : ''}`}>
    {eyebrow && <span className="eyebrow">{eyebrow}</span>}
    <h2>{title}</h2>
    {text && <p>{text}</p>}
  </div>;
}

function PageHero({ eyebrow, title, text, compact = false }) {
  return <section className={`page-hero ${compact ? 'page-hero-compact' : ''}`}>
    <div className="container page-hero-inner">
      <span className="eyebrow"><span className="eyebrow-mark" />{eyebrow}</span>
      <h1>{title}</h1>
      {text && <p>{text}</p>}
    </div>
  </section>;
}

function Empty({ title = 'Nothing here yet', text, icon: Icon = Sparkles, action }) {
  return <div className="empty-state">
    <span className="empty-icon"><Icon size={25} /></span>
    <h3>{title}</h3>
    <p>{text}</p>
    {action}
  </div>;
}

function LoadingState({ label = 'Loading…' }) {
  return <div className="loading-state" role="status"><span className="spinner" />{label}</div>;
}

function ErrorState({ error, onRetry }) {
  return <div className="error-state" role="alert">
    <div><strong>We couldn’t load this right now.</strong><p>{error}</p></div>
    {onRetry && <button className="btn btn-secondary btn-small" onClick={onRetry}>Try again</button>}
  </div>;
}

function useRemoteData(url, initialValue) {
  const [state, setState] = useState({ key: '', attempt: -1, data: initialValue, error: '' });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    api.get(url, { signal: controller.signal })
      .then(response => {
        if (!controller.signal.aborted) setState({ key: url, attempt, data: response.data.data ?? initialValue, error: '' });
      })
      .catch(reason => {
        if (reason.code !== 'ERR_CANCELED') setState({ key: url, attempt, data: initialValue, error: reason.response?.data?.message || reason.message || 'Please try again.' });
      });
    return () => controller.abort();
  }, [url, attempt, initialValue]);
  return {
    data: state.data,
    loading: state.key !== url || state.attempt !== attempt,
    error: state.key === url && state.attempt === attempt ? state.error : '',
    retry: () => setAttempt(value => value + 1)
  };
}

function Home() {
  const projectsQuery = useRemoteData('/projects?limit=3&featured=true', EMPTY_LIST);
  const settingsQuery = useRemoteData('/settings', EMPTY_OBJECT);
  const stats = settingsQuery.data?.homepageStats || {};
  const domains = [
    [BrainCircuit, 'Artificial intelligence'], [HeartPulse, 'Healthcare'], [Leaf, 'Agriculture'],
    [BriefcaseBusiness, 'Business technology'], [Users, 'Social innovation'], [Check, 'Education']
  ];
  const steps = ['Discover a real need', 'Research the context', 'Design a thoughtful response', 'Build and test together'];
  return <>
    <section className="hero-section">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow"><span className="pulse" /> A student-led innovation collective</span>
          <h1>Good ideas grow when <em>we build together.</em></h1>
          <p>We bring curious minds together to understand real-world challenges and create technology that makes a meaningful difference.</p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/projects">Explore our work <ArrowRight size={17} /></Link>
            <Link className="btn btn-secondary" to="/about">What is Prerna?</Link>
          </div>
          <div className="hero-note"><span className="avatar-stack"><i><img src="/logo.png" alt="" /></i><i>R</i><i>E</i></span><span>People-first. Evidence-led. Built together.</span></div>
        </div>
        <div className="hero-visual" aria-label="Innovation and collaboration illustration">
          <div className="hero-glow" /><div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="idea-card card-one"><BrainCircuit /><b>Research</b><span>Start with evidence</span></div>
          <div className="idea-card card-two"><Users /><b>Collaborate</b><span>Make it together</span></div>
          <div className="idea-card card-three"><Sparkles /><b>Make impact</b><span>Build with purpose</span></div>
          <div className="idea-core"><img className="core-logo" src="/logo.png" alt="PRERNA" /><b>PRERNA</b><small>Ideas into innovation</small></div>
        </div>
      </div>
      <a className="hero-scroll" href="#discover">Discover <ArrowDown size={14} /></a>
    </section>

    <section className="stats-strip" id="discover">
      <div className="container stats-grid">
        {[['communityMembers', 'Community members'], ['activeProjects', 'Active projects'], ['completedProjects', 'Completed projects'], ['collaborations', 'Collaborations']].map(([key, label]) =>
          <div className="stat-item" key={key}><strong>{Number(stats[key]) || 0}</strong><span>{label}</span></div>)}
      </div>
      {settingsQuery.error && <div className="container"><ErrorState error={settingsQuery.error} onRetry={settingsQuery.retry} /></div>}
    </section>

    <section className="section">
      <div className="container split-section">
        <div><span className="eyebrow">Why Prerna</span><h2 className="display-heading">Innovation is better when it starts with people.</h2></div>
        <div className="split-copy"><p>We connect students across disciplines to notice the needs around them, learn from the people affected, and turn careful research into practical solutions.</p><Link className="text-link" to="/about">Get to know us <ArrowRight size={16} /></Link></div>
      </div>
      <div className="container mission-grid">
        <article className="mission-card"><span className="number-tag">01 / MISSION</span><h3>Make room for meaningful work.</h3><p>Help students identify important problems and build practical responses through research, collaboration, and modern technology.</p></article>
        <article className="mission-card mission-card-accent"><span className="number-tag">02 / VISION</span><h3>Build technology that serves.</h3><p>Create a trusted community where young innovators make useful, accessible products that strengthen lives and communities.</p></article>
      </div>
    </section>

    <section className="section section-soft">
      <div className="container">
        <div className="section-heading-row"><SectionTitle eyebrow="Selected work" title="Ideas moving into the world" text="A look at projects the community is researching, shaping, and building." /><Link className="text-link desktop-link" to="/projects">All projects <ArrowRight size={16} /></Link></div>
        {projectsQuery.error && <ErrorState error={projectsQuery.error} onRetry={projectsQuery.retry} />}
        {projectsQuery.loading ? <LoadingState label="Finding featured projects…" /> : projectsQuery.data.length
          ? <div className="project-grid">{projectsQuery.data.map(project => <ProjectCard key={project._id} project={project} />)}</div>
          : !projectsQuery.error && <Empty title="The next idea could be yours." text="No featured projects have been published yet. Explore the portfolio or join the collective." action={<Link className="btn btn-secondary" to="/projects">Browse projects <ArrowRight size={16} /></Link>} />}
        <div className="mobile-link"><Link className="text-link" to="/projects">Explore all projects <ArrowRight size={16} /></Link></div>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <SectionTitle eyebrow="How we work" title="From curiosity to something useful." text="A clear, collaborative process helps good intentions become thoughtful outcomes." />
        <div className="process-grid">{steps.map((step, index) => <article className="process-card" key={step}><span>0{index + 1}</span><h3>{step}</h3><i /></article>)}</div>
      </div>
    </section>

    <section className="section section-soft">
      <div className="container">
        <SectionTitle eyebrow="Our domains" title="Different challenges. Shared purpose." text="We bring diverse interests together to work on issues that matter to people." />
        <div className="domain-grid">{domains.map(([Icon, label]) => <article className="domain-card" key={label}><span><Icon size={21} /></span><h3>{label}</h3></article>)}</div>
      </div>
    </section>

    <section className="cta-section"><div className="container cta-inner"><div><span className="eyebrow">Make something matter</span><h2>Bring your curiosity.<br />Find your collective.</h2><p>There’s room for your perspective, skills, and questions here.</p></div><Link className="btn btn-light" to="/join">Start your journey <ArrowRight size={17} /></Link><span className="cta-decoration">✳</span></div></section>
  </>;
}

function ProjectCard({ project }) {
  return <article className="project-card">
    <Link className="project-thumb" to={`/projects/${project.slug}`} aria-label={`View ${project.name}`}>
      {project.thumbnail ? <img src={assetUrl(project.thumbnail)} alt="" /> : <span className="thumb-mark"><img src="/logo.png" alt="" /></span>}
      <span className="thumb-arrow"><ArrowUpRight size={16} /></span>
    </Link>
    <div className="project-body">
      <div className="tags"><span>{project.category || project.domain}</span><span>{project.status}</span></div>
      <h3><Link to={`/projects/${project.slug}`}>{project.name}</Link></h3>
      <p>{project.description}</p>
      {!!project.technologyStack?.length && <div className="stack">{project.technologyStack.slice(0, 3).map(item => <span key={item}>{item}</span>)}</div>}
      <Link className="text-link" to={`/projects/${project.slug}`}>Discover project <ArrowRight size={15} /></Link>
    </div>
  </article>;
}

const PROJECT_CATEGORIES = ['Artificial Intelligence', 'Machine Learning', 'Education', 'Healthcare', 'Agriculture', 'Finance', 'Productivity', 'Social Impact', 'Other Innovations'];
const PROJECT_STATUSES = ['Idea', 'Problem Discovery', 'Research', 'Planning', 'Development', 'Testing', 'Completed', 'On Hold'];

function Projects() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), 250);
    return () => clearTimeout(timer);
  }, [search]);
  const params = new URLSearchParams({ limit: '50' });
  if (query) params.set('search', query);
  if (category) params.set('category', category);
  if (status) params.set('status', status);
  const result = useRemoteData(`/projects?${params.toString()}`, EMPTY_LIST);
  const clearFilters = () => { setSearch(''); setCategory(''); setStatus(''); };
  const hasFilters = search || category || status;
  return <>
    <PageHero eyebrow="Project portfolio" title="Ideas becoming useful technology." text="Explore the community’s published work, from early research to solutions already making an impact." />
    <section className="section">
      <div className="container">
        <div className="portfolio-toolbar">
          <label className="search-field"><Search size={18} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search projects, ideas, domains…" aria-label="Search projects" /></label>
          <label className="select-field"><span>Category</span><select value={category} onChange={event => setCategory(event.target.value)}><option value="">All categories</option>{PROJECT_CATEGORIES.map(value => <option key={value}>{value}</option>)}</select><ChevronDown size={15} /></label>
          <label className="select-field"><span>Status</span><select value={status} onChange={event => setStatus(event.target.value)}><option value="">All stages</option>{PROJECT_STATUSES.map(value => <option key={value}>{value}</option>)}</select><ChevronDown size={15} /></label>
        </div>
        <div className="results-row"><span>{result.loading ? 'Searching projects…' : `${result.data.length} ${result.data.length === 1 ? 'project' : 'projects'}`}</span>{hasFilters && <button className="clear-button" onClick={clearFilters}>Clear filters <X size={14} /></button>}</div>
        {result.error && <ErrorState error={result.error} onRetry={result.retry} />}
        {result.loading ? <LoadingState label="Loading projects…" /> : result.data.length
          ? <div className="project-grid">{result.data.map(project => <ProjectCard key={project._id} project={project} />)}</div>
          : !result.error && <Empty title={hasFilters ? 'No matching projects' : 'Our portfolio is growing'} text={hasFilters ? 'Try another search or clear some filters to see more projects.' : 'Published community projects will appear here as they are ready to share.'} action={hasFilters && <button className="btn btn-secondary" onClick={clearFilters}>Clear filters</button>} />}
      </div>
    </section>
  </>;
}

function ProjectDetails() {
  const { slug } = useParams();
  const result = useRemoteData(`/projects/${encodeURIComponent(slug)}`, null);
  if (result.loading) return <div className="container page-content"><LoadingState label="Loading project…" /></div>;
  if (result.error) return <div className="container page-content"><ErrorState error={result.error} onRetry={result.retry} /><Link className="text-link" to="/projects"><ArrowLeft size={16} /> Back to projects</Link></div>;
  const project = result.data;
  if (!project) return <NotFound compact />;
  const team = Array.isArray(project.teamMembers) ? project.teamMembers : [];
  return <>
    <PageHero compact eyebrow={project.category || project.domain} title={project.name} text={project.description} />
    <section className="section">
      <div className="container">
        <Link className="back-link" to="/projects"><ArrowLeft size={16} /> All projects</Link>
        <div className="detail-layout">
          <article className="detail-main">
            {project.thumbnail && <img className="detail-cover" src={assetUrl(project.thumbnail)} alt={`${project.name} project`} />}
            <span className="eyebrow">The idea</span><h2>Designed around a real need.</h2>
            <p>{project.overview || project.description}</p>
            {project.problemStatement && <><h3>The challenge</h3><p>{project.problemStatement}</p></>}
            {project.whyItMatters && <><h3>Why it matters</h3><p>{project.whyItMatters}</p></>}
            {(project.proposedSolution || project.keyFeatures?.length > 0) && <><h3>The approach</h3><p>{project.proposedSolution || 'A thoughtful, community-led approach to solving this challenge.'}</p></>}
            {!!project.keyFeatures?.length && <><h3>What it can do</h3><ul className="feature-list">{project.keyFeatures.map(feature => <li key={feature}><Check size={16} />{feature}</li>)}</ul></>}
            {!!project.images?.length && <div className="detail-gallery">{project.images.map(image => <img key={image} src={assetUrl(image)} alt={`${project.name} project`} />)}</div>}
            {!!project.roadmap?.length && <><h3>What’s next</h3><div className="roadmap">{project.roadmap.map(item => <div key={item._id || item.title}><span className={item.completed ? 'roadmap-dot complete' : 'roadmap-dot'} /> <div><strong>{item.title}</strong>{item.description && <p>{item.description}</p>}</div></div>)}</div></>}
          </article>
          <aside className="project-aside">
            <span className="eyebrow">Project snapshot</span><h3>{project.status}</h3>
            <div className="progress-track"><span style={{ width: `${project.progress || 0}%` }} /></div><p className="progress-label">{project.progress || 0}% progress</p>
            {!!project.technologyStack?.length && <><h4>Built with</h4><div className="stack">{project.technologyStack.map(item => <span key={item}>{item}</span>)}</div></>}
            {!!project.targetAudience?.length && <><h4>For</h4><div className="stack">{project.targetAudience.map(item => <span key={item}>{item}</span>)}</div></>}
            {team.length > 0 && <><h4>Community team</h4><div className="project-team">{team.map(member => <span key={member._id}>{member.name}{member.role ? ` · ${member.role}` : ''}</span>)}</div></>}
            {(project.demoUrl || project.githubUrl) && <div className="detail-links">
              {project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noreferrer">Live demo <ExternalLink size={14} /></a>}
              {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noreferrer">Source code <Code2 size={14} /></a>}
            </div>}
          </aside>
        </div>
      </div>
    </section>
  </>;
}

function Team() {
  const result = useRemoteData('/team', EMPTY_LIST);
  return <>
    <PageHero eyebrow="Our people" title="Different disciplines. One collective purpose." text="Meet the people bringing research, design, engineering, and communication together." />
    <section className="section"><div className="container">
      {result.error && <ErrorState error={result.error} onRetry={result.retry} />}
      {result.loading ? <LoadingState label="Loading the team…" /> : result.data.length
        ? <><div className="team-intro"><span>{result.data.length} community {result.data.length === 1 ? 'member' : 'members'}</span><p>People power every idea we bring to life.</p></div><div className="team-grid">{result.data.map(member => <TeamCard key={member._id} member={member} />)}</div></>
        : !result.error && <Empty title="Our team is taking shape" text="Team profiles will be shared here as members join and publish their profiles." action={<Link className="btn btn-primary" to="/join">Become a member <ArrowRight size={16} /></Link>} />}
    </div></section>
    <section className="cta-section"><div className="container cta-inner"><div><span className="eyebrow">Your voice belongs here</span><h2>Bring your skills.<br />Find your people.</h2><p>There are many ways to contribute to meaningful work.</p></div><Link className="btn btn-light" to="/join">Join the team <ArrowRight size={17} /></Link><span className="cta-decoration">✳</span></div></section>
  </>;
}

function TeamCard({ member }) {
  return <article className="team-card">
    <div className="team-avatar">{member.image ? <img src={assetUrl(member.image)} alt={member.name} /> : <img src="/logo.png" alt="" />}</div>
    <div className="team-meta">{member.leadership && <span className="leadership-tag">Community lead</span>}<h3>{member.name}</h3><p>{member.role}{member.department ? ` · ${member.department}` : ''}</p></div>
    {member.bio && <p className="team-bio">{member.bio}</p>}
    {member.skills?.length > 0 && <div className="stack">{member.skills.slice(0, 4).map(skill => <span key={skill}>{skill}</span>)}</div>}
    {(member.linkedinUrl || member.githubUrl || member.portfolioUrl) && <div className="social-links">
      {member.linkedinUrl && <a href={member.linkedinUrl} target="_blank" rel="noreferrer" aria-label={`${member.name} on LinkedIn`}><Link2 size={16} /></a>}
      {member.githubUrl && <a href={member.githubUrl} target="_blank" rel="noreferrer" aria-label={`${member.name} on GitHub`}><Code2 size={16} /></a>}
      {member.portfolioUrl && <a href={member.portfolioUrl} target="_blank" rel="noreferrer" aria-label={`${member.name}'s portfolio`}><ExternalLink size={16} /></a>}
    </div>}
  </article>;
}

const PROBLEM_DOMAINS = ['Artificial Intelligence', 'Education', 'Healthcare', 'Agriculture', 'Finance', 'Social Innovation', 'Business Technology', 'Other'];

function Problems() {
  const [domain, setDomain] = useState('');
  const params = new URLSearchParams();
  if (domain) params.set('domain', domain);
  const result = useRemoteData(`/problems${params.size ? `?${params}` : ''}`, EMPTY_LIST);
  return <>
    <PageHero eyebrow="Problem lab" title="Real challenges deserve careful research." text="Explore problems shared by the community—then help us find and validate ideas that can make a difference." />
    <section className="section"><div className="container">
      <div className="section-heading-row problem-toolbar"><SectionTitle eyebrow="Community research" title="Start with the challenge." text="Each approved submission is an invitation to learn more, ask better questions, and explore possible responses." />
        <label className="select-field"><span>Domain</span><select value={domain} onChange={event => setDomain(event.target.value)}><option value="">All domains</option>{PROBLEM_DOMAINS.map(value => <option key={value}>{value}</option>)}</select><ChevronDown size={15} /></label>
      </div>
      <div className="problem-actions"><span>{result.loading ? 'Loading problem statements…' : `${result.data.length} ${result.data.length === 1 ? 'challenge' : 'challenges'}`}</span><Link className="btn btn-primary" to="/problems/submit">Share a problem <ArrowRight size={16} /></Link></div>
      {result.error && <ErrorState error={result.error} onRetry={result.retry} />}
      {result.loading ? <LoadingState label="Loading problem statements…" /> : result.data.length
        ? <div className="problem-grid">{result.data.map(problem => <article className="problem-card" key={problem._id}><span className="problem-domain">{problem.domain}</span><h3>{problem.title}</h3><p>{problem.description}</p><div className="problem-footer"><span>{problem.location || 'Community submitted'}</span><span className="status-tag">{problem.researchStatus || 'Submitted'}</span></div></article>)}</div>
        : !result.error && <Empty title="The lab is ready for its first challenge." text="No approved problem statements are published yet. You can submit one for review." action={<Link className="btn btn-primary" to="/problems/submit">Share a problem <ArrowRight size={16} /></Link>} />}
    </div></section>
  </>;
}

function FormNotice({ type = 'success', children }) {
  return <div className={`form-notice ${type}`} role={type === 'error' ? 'alert' : 'status'}>{type === 'success' ? <Check size={18} /> : <X size={18} />}<span>{children}</span></div>;
}

function ProblemSubmit() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault();
    setLoading(true); setError(''); setSuccess(false);
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    try {
      await api.post('/problems', data);
      setSuccess(true);
      form.reset();
    } catch (reason) {
      setError(reason.response?.data?.message || 'Your submission could not be sent. Please check your connection and try again.');
    } finally { setLoading(false); }
  }
  return <>
    <PageHero eyebrow="Problem lab · Contribute" title="Help us understand a challenge." text="Share a real issue you have observed. Our team reviews every submission before publishing it to the community." />
    <section className="section"><div className="container form-page-layout">
      <aside className="form-aside"><Link className="back-link" to="/problems"><ArrowLeft size={16} /> Back to the problem lab</Link><div className="form-aside-content"><span className="eyebrow">What makes a useful submission?</span><h2>Start with what you’ve seen.</h2><p>The strongest problem statements are specific, grounded in observation, and honest about what still needs to be learned.</p><ul className="aside-checks"><li><Check size={16} />Describe who is affected</li><li><Check size={16} />Share context and evidence</li><li><Check size={16} />Avoid including sensitive personal data</li></ul></div></aside>
      <form className="form-card" onSubmit={submit}>
        <div className="form-heading"><span className="eyebrow">Submit a challenge</span><h2>Tell us what’s happening.</h2><p>Fields marked with * are required.</p></div>
        {success && <FormNotice>Your submission is in review. Thank you for helping the community learn.</FormNotice>}
        {error && <FormNotice type="error">{error}</FormNotice>}
        <label>Problem title *<input name="title" required maxLength={140} placeholder="A short, clear description of the challenge" /></label>
        <label>What is the problem? *<textarea name="description" required minLength={20} rows={5} placeholder="Describe what happens, where, and why it matters…" /></label>
        <div className="form-grid">
          <label>Domain *<select name="domain" required defaultValue=""><option value="" disabled>Select a domain</option>{PROBLEM_DOMAINS.map(value => <option key={value}>{value}</option>)}</select></label>
          <label>Location or region<input name="location" maxLength={120} placeholder="City, region, or context" /></label>
          <label className="form-span">Who is affected?<input name="affectedPeople" maxLength={200} placeholder="Describe the people or groups affected" /></label>
        </div>
        <label>Evidence or observations<textarea name="evidence" rows={3} placeholder="What have you observed, researched, or heard directly?" /></label>
        <label>Your name (optional)<input name="submittedBy" maxLength={100} autoComplete="name" /></label>
        <label>Email (optional)<input name="submittedByEmail" type="email" autoComplete="email" /></label>
        <button className="btn btn-primary form-submit" disabled={loading}>{loading ? 'Submitting…' : 'Submit for review'}{!loading && <Send size={16} />}</button>
      </form>
    </div></section>
  </>;
}

const DEPARTMENTS = ['Leadership', 'AI and Backend', 'Frontend and UI/UX', 'Data and Research', 'Testing and Deployment', 'Marketing and Communication', 'Content and Documentation'];

function Join() {
  const navigate = useNavigate();
  const [mode, setMode] = useState(getCommunityToken() ? 'login' : 'register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpPhase, setOtpPhase] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [registrationData, setRegistrationData] = useState(null);
  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    if (mode === 'forgot') {
      try {
        const response = await api.post('/community/auth/reset/send', { email: data.email });
        setOtpEmail(response.data.data.email);
        setOtpPhase('reset');
      } catch (reason) {
        setError(reason.response?.data?.message || 'Unable to send reset code.');
      } finally { setLoading(false); }
      return;
    }
    data.privacyConsent = mode === 'register' ? form.elements.privacyConsent.checked : undefined;
    if (mode === 'register' && data.password !== data.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    try {
      if (mode === 'register') {
        setRegistrationData(data);
        const response = await api.post('/community/auth/register', data);
        setOtpEmail(response.data.data.email);
        setOtpPhase('register');
      } else {
        const response = await api.post('/community/auth/login', data);
        localStorage.setItem(COMMUNITY_TOKEN_KEY, response.data.data.accessToken);
        localStorage.setItem(COMMUNITY_USER_KEY, JSON.stringify(response.data.data.user));
        navigate('/profile');
        window.location.reload();
      }
    } catch (reason) {
      setError(reason.response?.data?.message || 'Unable to continue. Please try again.');
    } finally {
      setLoading(false);
    }
  }
  async function verifyOtp(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (otpPhase === 'register') {
        const response = await api.post('/community/auth/register/verify', { email: otpEmail, otp });
        localStorage.setItem(COMMUNITY_TOKEN_KEY, response.data.data.accessToken);
        localStorage.setItem(COMMUNITY_USER_KEY, JSON.stringify(response.data.data.user));
        navigate('/profile');
        window.location.reload();
      } else {
        if (resetPassword !== resetConfirmPassword) throw new Error('Passwords do not match.');
        if (resetPassword.length < 8) throw new Error('New password must be at least 8 characters.');
        await api.post('/community/auth/reset/verify', { email: otpEmail, otp, newPassword: resetPassword });
        setOtpPhase('');
        setMode('login');
        setError('');
        setOtp('');
        setResetPassword('');
        setResetConfirmPassword('');
      }
    } catch (reason) {
      setError(reason.response?.data?.message || reason.message || 'Unable to verify code.');
    } finally { setLoading(false); }
  }
  async function resendOtp() {
    setLoading(true);
    setError('');
    try {
      if (otpPhase === 'register') {
        if (!registrationData) throw new Error('Please start registration again.');
        await api.post('/community/auth/register', registrationData);
        setError('A new verification code has been sent.');
      } else {
        await api.post('/community/auth/reset/send', { email: otpEmail });
        setError('A new reset code has been sent.');
      }
    } catch (reason) {
      setError(reason.response?.data?.message || 'Unable to resend code.');
    } finally { setLoading(false); }
  }
  if (getCommunityToken()) return <Navigate to="/profile" replace />;
  return <>
    <main className="account-page">
      <div className="account-orb account-orb-one" />
      <div className="account-orb account-orb-two" />
      <section className="account-shell">
        <div className="account-brand-panel">
          <Link className="account-logo" to="/" aria-label="PRERNA home"><img src="/logo.png" alt="PRERNA" /></Link>
          <div className="account-brand-copy"><span>Community access</span><h1>{otpPhase === 'register' ? 'Verify your email.' : otpPhase === 'reset' ? 'Restore access.' : mode === 'register' ? 'Create your account.' : mode === 'forgot' ? 'Reset your password.' : 'Welcome back.'}</h1><p>{otpPhase ? 'A quick, secure step keeps every community profile protected.' : mode === 'register' ? 'Join the collective and start building meaningful ideas.' : mode === 'forgot' ? 'We’ll send a secure reset code to your email.' : 'Sign in to continue where you left off.'}</p></div>
          <div className="account-progress" aria-hidden="true"><span className={otpPhase ? 'complete' : 'active'} /><span className={otpPhase ? 'active' : ''} /></div>
        </div>
        <div className="account-form-panel">
      {otpPhase ? <form className="form-card account-form otp-form" onSubmit={verifyOtp}>
        <div className="form-heading"><span className="eyebrow">Email verification</span><h2>{otpPhase === 'register' ? 'Check your inbox.' : 'Reset your password.'}</h2><p>Enter the 6-digit code sent to <strong>{otpEmail}</strong>. It expires in 10 minutes.</p></div>
        {error && <FormNotice type="error">{error}</FormNotice>}
        <label>6-digit verification code<input className="otp-input" name="otp" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={event => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} required autoComplete="one-time-code" /></label>
        {otpPhase === 'reset' && <><label>New password<input type="password" value={resetPassword} onChange={event => setResetPassword(event.target.value)} required minLength={8} autoComplete="new-password" /></label><label>Confirm new password<input type="password" value={resetConfirmPassword} onChange={event => setResetConfirmPassword(event.target.value)} required minLength={8} autoComplete="new-password" /></label></>}
        <div className="otp-actions"><button type="button" className="secondary-button" onClick={() => { setOtpPhase(''); setError(''); setOtp(''); }}>Back</button><button type="button" className="text-link otp-resend" onClick={resendOtp} disabled={loading}>Resend code</button><button className="btn btn-primary form-submit" disabled={loading || otp.length !== 6}>{loading ? 'Please wait…' : otpPhase === 'register' ? 'Verify & create account' : 'Reset password'}<ArrowRight size={16} /></button></div>
      </form> : <form className="form-card account-form" onSubmit={submit}>
        <div className="account-tabs" role="tablist"><button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setError(''); }}>Create account</button><button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError(''); }}>Sign in</button><button type="button" className={mode === 'forgot' ? 'active' : ''} onClick={() => { setMode('forgot'); setError(''); }}>Reset</button></div>
        <div className="form-heading"><span className="eyebrow">{mode === 'register' ? 'Join Prerna' : mode === 'forgot' ? 'Password recovery' : 'Member login'}</span><h2>{mode === 'register' ? 'Let’s get to know you.' : mode === 'forgot' ? 'Recover your account.' : 'Good to see you again.'}</h2></div>
        {error && <FormNotice type="error">{error}</FormNotice>}
        {mode === 'register' ? <div className="simple-register-fields">
          <label>Full name *<input name="name" required autoComplete="name" maxLength={120} placeholder="Your full name" /></label>
          <label>Email address *<input name="email" type="email" required autoComplete="email" placeholder="you@example.com" /></label>
          <label>Mobile number *<input name="phone" type="tel" required autoComplete="tel" placeholder="+91 98765 43210" /></label>
        </div> : <div className="form-grid">
          <label className="form-span">Email address *<input name="email" type="email" required autoComplete="email" placeholder="you@example.com" /></label>
        </div>}
        {mode !== 'forgot' && <label>Password *<input name="password" type="password" required minLength={8} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} /></label>}
        {mode === 'register' && <><label>Confirm password *<input name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" /></label>
          <label className="checkbox-field"><input name="privacyConsent" type="checkbox" required /><span>I agree to the <Link to="/terms">Terms &amp; Conditions</Link> and <Link to="/privacy-policy">Privacy Policy</Link>. *</span></label></>}
        <button className="btn btn-primary form-submit" disabled={loading}>{loading ? 'Please wait…' : mode === 'register' ? 'Create account & send code' : mode === 'forgot' ? 'Send reset code' : 'Sign in'}<ArrowRight size={16} /></button>
      </form>}
        </div>
      </section>
    </main>
  </>;
}

function ProtectedProfile({ settingsOnly = false }) {
  const token = getCommunityToken();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(getCommunityUser());
  const [tab, setTab] = useState(settingsOnly ? 'settings' : 'overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  useEffect(() => {
    if (!token) return;
    let active = true;
    api.get('/community/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(response => {
        if (active) {
          setProfile(response.data.data);
          localStorage.setItem(COMMUNITY_USER_KEY, JSON.stringify(response.data.data));
        }
      })
      .catch(reason => {
        if (active) setError(reason.response?.data?.message || 'Unable to load your profile.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);
  if (!token) return <Navigate to="/join" replace />;

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    const form = event.currentTarget;
    const data = new FormData(form);
    data.delete('avatar');
    data.delete('resume');
    const avatar = form.elements.avatar?.files?.[0];
    const resume = form.elements.resume?.files?.[0];
    if (avatar) data.append('avatar', avatar);
    if (resume) data.append('resume', resume);
    if (profile.notificationSettings) data.set('notificationSettings', JSON.stringify(profile.notificationSettings));
    if (profile.accountSettings) data.set('accountSettings', JSON.stringify(profile.accountSettings));
    try {
      const response = await api.put('/community/profile', data, { headers: { Authorization: `Bearer ${token}` } });
      setProfile(response.data.data);
      localStorage.setItem(COMMUNITY_USER_KEY, JSON.stringify(response.data.data));
      setSuccess('Profile updated successfully.');
    } catch (reason) {
      setError(reason.response?.data?.message || 'Unable to update profile.');
    } finally { setSaving(false); }
  }
  async function saveSettings(event) {
    event.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    const form = new FormData(event.currentTarget);
    const notificationSettings = {
      projectUpdates: form.has('projectUpdates'),
      applicationUpdates: form.has('applicationUpdates'),
      communityNews: form.has('communityNews')
    };
    const accountSettings = {
      profileVisibility: form.get('profileVisibility'),
      showEmail: form.has('showEmail'),
      showPhone: form.has('showPhone')
    };
    const data = new FormData();
    data.set('notificationSettings', JSON.stringify(notificationSettings));
    data.set('accountSettings', JSON.stringify(accountSettings));
    try {
      const response = await api.put('/community/profile', data, { headers: { Authorization: `Bearer ${token}` } });
      setProfile(response.data.data);
      localStorage.setItem(COMMUNITY_USER_KEY, JSON.stringify(response.data.data));
      setSuccess('Account settings saved.');
    } catch (reason) {
      setError(reason.response?.data?.message || 'Unable to save settings.');
    } finally { setSaving(false); }
  }
  async function changePassword(event) {
    event.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    const data = Object.fromEntries(new FormData(event.currentTarget));
    if (data.newPassword !== data.confirmPassword) {
      setError('New passwords do not match.');
      setSaving(false);
      return;
    }
    try {
      await api.put('/community/profile/password', data, { headers: { Authorization: `Bearer ${token}` } });
      event.currentTarget.reset();
      setSuccess('Password changed successfully.');
    } catch (reason) {
      setError(reason.response?.data?.message || 'Unable to change password.');
    } finally { setSaving(false); }
  }
  function logout() {
    localStorage.removeItem(COMMUNITY_TOKEN_KEY);
    localStorage.removeItem(COMMUNITY_USER_KEY);
    navigate('/join');
    window.location.reload();
  }
  async function deleteAccount() {
    if (!window.confirm('Delete your community account permanently? This cannot be undone.')) return;
    setSaving(true); setError('');
    try {
      await api.delete('/community/account', { headers: { Authorization: `Bearer ${token}` } });
      localStorage.removeItem(COMMUNITY_TOKEN_KEY);
      localStorage.removeItem(COMMUNITY_USER_KEY);
      navigate('/join');
      window.location.reload();
    } catch (reason) {
      setError(reason.response?.data?.message || 'Unable to delete account.');
      setSaving(false);
    }
  }
  if (loading) return <div className="container page-content"><LoadingState label="Loading your profile…" /></div>;
  const avatarSource = profile?.avatarUrl ? assetUrl(profile.avatarUrl) : '/logo.png';
  const profileFields = [
    profile?.college, profile?.course, profile?.state, profile?.preferredDepartment,
    profile?.bio, profile?.skills?.length, profile?.areasOfInterest?.length,
    profile?.linkedinUrl || profile?.githubUrl || profile?.portfolioUrl, profile?.resumeUrl
  ];
  const profileCompletion = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);
  return <>
    <main className="profile-page">
    <section className="profile-dashboard"><div className="container profile-layout">
      <aside className="profile-sidebar">
        <div className="profile-identity">
          <div className="profile-avatar"><img src={avatarSource} alt={profile?.name || 'Profile'} />{profile?.emailVerified && <span className="verified-badge" title="Email verified"><Check size={12} /></span>}</div>
          <div><h2>{profile?.name}</h2><p>{profile?.preferredDepartment || 'Community member'}</p></div>
        </div>
        <div className="profile-status"><span>Email status</span><strong>{profile?.emailVerified ? 'Verified' : 'Pending'}</strong></div>
        <nav aria-label="Profile sections">
          <button className={tab === 'overview' ? 'active' : ''} onClick={() => { setTab('overview'); setSuccess(''); setError(''); }}><span>Overview</span><ArrowRight size={14} /></button>
          <button className={tab === 'profile' ? 'active' : ''} onClick={() => { setTab('profile'); setSuccess(''); setError(''); }}><span>My profile</span><ArrowRight size={14} /></button>
          <button className={tab === 'settings' ? 'active' : ''} onClick={() => { setTab('settings'); setSuccess(''); setError(''); }}><span>Settings</span><ArrowRight size={14} /></button>
          <button className={tab === 'password' ? 'active' : ''} onClick={() => { setTab('password'); setSuccess(''); setError(''); }}><span>Password & security</span><ArrowRight size={14} /></button>
        </nav>
        <button className="profile-logout" onClick={logout}>Sign out</button>
      </aside>
      <div className="profile-content">
        {error && <FormNotice type="error">{error}</FormNotice>}
        {success && <FormNotice>{success}</FormNotice>}
        {tab === 'overview' && <div className="profile-overview">
          <div className="profile-welcome"><div><span className="eyebrow">Member workspace</span><h1>Welcome back, {profile?.name?.split(' ')[0] || 'member'}.</h1><p>Keep your profile complete and ready for community opportunities.</p></div><button className="btn btn-primary" onClick={() => setTab('profile')}>Edit profile <ArrowRight size={16} /></button></div>
          <div className="profile-metrics">
            <article><span>Profile completion</span><strong>{profileCompletion}%</strong><div className="completion-track"><i style={{ width: `${profileCompletion}%` }} /></div></article>
            <article><span>Email verification</span><strong>{profile?.emailVerified ? 'Verified' : 'Pending'}</strong><p>{profile?.email || '—'}</p></article>
            <article><span>Community department</span><strong>{profile?.preferredDepartment || 'Not set'}</strong><p>{profile?.weeklyAvailability ? `${profile.weeklyAvailability} weekly` : 'Availability not set'}</p></article>
          </div>
          <div className="profile-overview-grid">
            <article className="profile-summary-card"><div className="card-heading"><div><span className="eyebrow">Profile details</span><h2>About you</h2></div><button className="icon-button" title="Edit profile" onClick={() => setTab('profile')}>Edit</button></div><dl>
              <div><dt>College</dt><dd>{profile?.college || 'Not added'}</dd></div><div><dt>Course</dt><dd>{profile?.course || 'Not added'}</dd></div><div><dt>Location</dt><dd>{profile?.state || 'Not added'}</dd></div><div><dt>Department</dt><dd>{profile?.preferredDepartment || 'Not added'}</dd></div>
            </dl>{profile?.bio && <p className="profile-bio">{profile.bio}</p>}</article>
            <article className="profile-summary-card"><span className="eyebrow">Skills & interests</span><h2>Your focus</h2><div className="profile-chips">{profile?.skills?.length ? profile.skills.map(skill => <span key={skill}>{skill}</span>) : <p>No skills added yet.</p>}</div><h3>Areas of interest</h3><div className="profile-chips">{profile?.areasOfInterest?.length ? profile.areasOfInterest.map(area => <span key={area}>{area}</span>) : <p>No interests added yet.</p>}</div></article>
          </div>
          <div className="profile-links-card"><div><span className="eyebrow">External profile</span><h2>Links & documents</h2></div><div>{profile?.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={14} /></a>}{profile?.githubUrl && <a href={profile.githubUrl} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={14} /></a>}{profile?.portfolioUrl && <a href={profile.portfolioUrl} target="_blank" rel="noreferrer">Portfolio <ArrowUpRight size={14} /></a>}{profile?.resumeUrl && <a href={assetUrl(profile.resumeUrl)} target="_blank" rel="noreferrer">Resume <ArrowUpRight size={14} /></a>}{!profile?.linkedinUrl && !profile?.githubUrl && !profile?.portfolioUrl && !profile?.resumeUrl && <p>No external links or resume added.</p>}</div></div>
        </div>}
        {tab === 'profile' && <form className="form-card profile-form" onSubmit={saveProfile}>
          <div className="form-heading"><span className="eyebrow">Personal profile</span><h2>About you</h2><p>Keep this information current so the community can understand your interests.</p></div>
          <div className="form-grid">
            <label>Full name<input name="name" required defaultValue={profile?.name || ''} /></label>
            <label>Phone<input name="phone" defaultValue={profile?.phone || ''} /></label>
            <label>College / university<input name="college" defaultValue={profile?.college || ''} /></label>
            <label>Course<input name="course" defaultValue={profile?.course || ''} /></label>
            <label>Year of study<select name="yearOfStudy" defaultValue={profile?.yearOfStudy || ''}><option value="">—</option>{['1st', '2nd', '3rd', '4th', 'Postgraduate', 'Other'].map(value => <option key={value}>{value}</option>)}</select></label>
            <label>State<input name="state" defaultValue={profile?.state || ''} /></label>
            <label>Preferred department<select name="preferredDepartment" defaultValue={profile?.preferredDepartment || ''}><option value="">—</option>{DEPARTMENTS.map(value => <option key={value}>{value}</option>)}</select></label>
            <label>Weekly availability<input name="weeklyAvailability" defaultValue={profile?.weeklyAvailability || ''} /></label>
            <label className="form-span">Skills (comma separated)<input name="skills" defaultValue={(profile?.skills || []).join(', ')} /></label>
            <label className="form-span">Areas of interest (comma separated)<input name="areasOfInterest" defaultValue={(profile?.areasOfInterest || []).join(', ')} /></label>
            <label>LinkedIn profile<input name="linkedinUrl" type="url" defaultValue={profile?.linkedinUrl || ''} /></label>
            <label>GitHub profile<input name="githubUrl" type="url" defaultValue={profile?.githubUrl || ''} /></label>
            <label>Portfolio URL<input name="portfolioUrl" type="url" defaultValue={profile?.portfolioUrl || ''} /></label>
            <label>Profile photo<input name="avatar" type="file" accept="image/png,image/jpeg,image/webp" /></label>
            <label className="form-span">Resume (PDF)<input name="resume" type="file" accept=".pdf,application/pdf" /></label>
          </div>
          <label>Short bio<textarea name="bio" rows={4} defaultValue={profile?.bio || ''} /></label>
          <button className="btn btn-primary form-submit" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}<Check size={16} /></button>
        </form>}
        {tab === 'settings' && <form className="form-card profile-form" onSubmit={saveSettings}>
          <div className="form-heading"><span className="eyebrow">Account settings</span><h2>Privacy and notifications</h2></div>
          <section className="settings-section"><h3>Profile visibility</h3><label>Who can see your profile?<select name="profileVisibility" defaultValue={profile?.accountSettings?.profileVisibility || 'community'}><option value="public">Everyone</option><option value="community">PRERNA members</option><option value="private">Only me</option></select></label>
            <label className="checkbox-field"><input name="showEmail" type="checkbox" defaultChecked={Boolean(profile?.accountSettings?.showEmail)} /><span>Show email on my public profile</span></label>
            <label className="checkbox-field"><input name="showPhone" type="checkbox" defaultChecked={Boolean(profile?.accountSettings?.showPhone)} /><span>Show phone on my public profile</span></label>
          </section>
          <section className="settings-section"><h3>Notifications</h3>
            <label className="checkbox-field"><input name="projectUpdates" type="checkbox" defaultChecked={profile?.notificationSettings?.projectUpdates !== false} /><span>Project updates</span></label>
            <label className="checkbox-field"><input name="applicationUpdates" type="checkbox" defaultChecked={profile?.notificationSettings?.applicationUpdates !== false} /><span>Application updates</span></label>
            <label className="checkbox-field"><input name="communityNews" type="checkbox" defaultChecked={profile?.notificationSettings?.communityNews !== false} /><span>Community news and announcements</span></label>
          </section>
          <section className="settings-section danger-settings"><h3>Danger zone</h3><p>Permanently delete your PRERNA community account and profile.</p><button type="button" className="danger-button" disabled={saving} onClick={deleteAccount}>Delete account</button></section>
          <button className="btn btn-primary form-submit" disabled={saving}>{saving ? 'Saving…' : 'Save settings'}<Check size={16} /></button>
        </form>}
        {tab === 'password' && <form className="form-card profile-form" onSubmit={changePassword}>
          <div className="form-heading"><span className="eyebrow">Security</span><h2>Change password</h2></div>
          <label>Current password *<input name="currentPassword" type="password" required autoComplete="current-password" /></label>
          <label>New password *<input name="newPassword" type="password" required minLength={8} autoComplete="new-password" /></label>
          <label>Confirm new password *<input name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" /></label>
          <button className="btn btn-primary form-submit" disabled={saving}>{saving ? 'Updating…' : 'Change password'}<Check size={16} /></button>
        </form>}
      </div>
    </div></section>
    </main>
  </>;
}

function Contact() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault();
    setLoading(true); setError(''); setSuccess(false);
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    try {
      await api.post('/contact', data);
      setSuccess(true);
      form.reset();
    } catch (reason) {
      setError(reason.response?.data?.message || 'Your message could not be sent. Please try again in a moment.');
    } finally { setLoading(false); }
  }
  return <>
    <PageHero eyebrow="Contact" title="Let’s start a conversation." text="Have a question, a collaboration in mind, or a perspective to share? We’d love to hear from you." />
    <section className="section"><div className="container contact-layout">
      <div className="contact-copy"><span className="eyebrow">Get in touch</span><h2 className="display-heading">Good things begin with a hello.</h2><p>Tell us a little about what you have in mind. The right person on our team will follow up.</p>
        <a className="contact-email" href="mailto:hello@prerna.org"><span><Send size={18} /></span><div><small>Email us directly</small><strong>hello@prerna.org</strong></div><ArrowUpRight size={16} /></a>
        <div className="contact-note"><span className="pulse" />We usually respond within a few working days.</div>
      </div>
      <form className="form-card" onSubmit={submit}>
        <div className="form-heading"><span className="eyebrow">Send a message</span><h2>What’s on your mind?</h2></div>
        {success && <FormNotice>Your message has been received. We’ll be in touch soon.</FormNotice>}
        {error && <FormNotice type="error">{error}</FormNotice>}
        <div className="form-grid">
          <label>Your name *<input name="name" required autoComplete="name" maxLength={120} /></label>
          <label>Email address *<input name="email" type="email" required autoComplete="email" /></label>
        </div>
        <label>What is this about? *<select name="enquiryType" required defaultValue="General"><option>General</option><option>Collaboration</option><option>Mentorship</option></select></label>
        <label>Subject *<input name="subject" required maxLength={160} /></label>
        <label>Your message *<textarea name="message" required minLength={10} rows={5} placeholder="Share a few details so we can direct your message…" /></label>
        <button className="btn btn-primary form-submit" disabled={loading}>{loading ? 'Sending…' : 'Send message'}{!loading && <Send size={16} />}</button>
      </form>
    </div></section>
  </>;
}

function TermsAndConditions() {
  const sections = [
    ['Using PRERNA', 'By creating an account or using this website, you agree to use PRERNA lawfully and respectfully. You must be at least 13 years old, or have permission from a parent or legal guardian, to submit personal information.'],
    ['Community participation', 'Contribute accurate information, respect other members, and avoid harassment, spam, misleading claims, harmful code, or content that infringes the rights of others. PRERNA may remove content or restrict access when it protects the community or its work.'],
    ['Accounts and security', 'You are responsible for keeping your account details and password secure. Please notify us promptly if you believe your account has been accessed without permission.'],
    ['Projects and submissions', 'Information you share for a project or problem may be visible to the community where participation requires it. Do not submit confidential, private, or third-party information unless you have permission and a clear right to share it.'],
    ['Intellectual property', 'The PRERNA website, branding, and published materials belong to PRERNA or their respective owners. You retain ownership of your original contributions, while granting PRERNA permission to host and display them for community and platform purposes.'],
    ['Third-party services', 'Some features or external links may use third-party services. We are not responsible for independent websites or services outside PRERNA; their own terms apply.'],
    ['Availability and responsibility', 'The platform is provided on an “as available” basis. We work to keep it useful and reliable, but do not guarantee uninterrupted service or the accuracy or suitability of all community content.'],
    ['Changes', 'We may update these Terms as PRERNA grows or its practices change. Material updates will be reflected on this page, with the effective date shown below.'],
    ['Contact', 'Questions about these Terms can be sent to hello@prerna.org or through the Contact page.']
  ];
  return <>
    <PageHero compact eyebrow="Legal" title="Terms &amp; Conditions" text="Clear guidelines for a respectful, safe, and useful PRERNA community." />
    <section className="legal-section"><div className="container legal-layout">
      <aside className="legal-aside"><span className="eyebrow">Document</span><strong>Terms &amp; Conditions</strong><p>Effective: November 20, 2026</p><Link className="text-link" to="/privacy-policy">Read our Privacy Policy <ArrowRight size={15} /></Link></aside>
      <article className="legal-document">
        <p className="legal-intro">These Terms &amp; Conditions explain the rules that apply when you visit PRERNA, join the community, or contribute an idea or project.</p>
        {sections.map(([title, text], index) => <section className="legal-block" key={title}><span>{String(index + 1).padStart(2, '0')}</span><div><h2>{title}</h2><p>{text}</p></div></section>)}
      </article>
    </div></section>
  </>;
}

function PrivacyPolicy() {
  const sections = [
    ['Information we collect', 'We may collect the name, email address, department or role, profile details, and account credentials you provide. We may also receive messages, problem submissions, project information, and technical usage data needed to operate the platform.'],
    ['How we use information', 'We use information to create and protect accounts, verify community access, show relevant member information, operate projects and problem submissions, respond to requests, and improve the reliability of PRERNA.'],
    ['Community visibility', 'Profile details and contributions may be shown to other users when that visibility is necessary for the selected community feature. Please do not include sensitive personal or confidential information in public submissions.'],
    ['Account security', 'Passwords and authentication sessions are handled through security controls intended to prevent unauthorized access. You should use a strong, unique password and keep your login details private.'],
    ['Cookies and local storage', 'PRERNA may use browser storage or similar technologies to remember sign-in status and user preferences. These records help maintain sessions and improve the experience.'],
    ['Data sharing', 'We do not sell personal information. We may share limited information with service providers that support hosting, email, security, or other platform operations, or when required by law or to protect users and PRERNA.'],
    ['Retention', 'We retain information for as long as needed to provide the service, maintain community records, meet legal obligations, resolve disputes, and prevent abuse. We may remove or anonymize data when it is no longer needed.'],
    ['Your choices', 'You may ask to review or update your profile, request deletion of an account where applicable, or unsubscribe from optional communications. Some information may need to be retained for safety, security, or legal reasons.'],
    ['Updates and contact', 'We may revise this Privacy Policy as our practices or services change. The latest effective date will appear on this page. Questions or privacy requests can be sent to hello@prerna.org.']
  ];
  return <>
    <PageHero compact eyebrow="Privacy" title="Privacy Policy" text="How PRERNA collects, uses, protects, and shares community information." />
    <section className="legal-section"><div className="container legal-layout">
      <aside className="legal-aside"><span className="eyebrow">Document</span><strong>Privacy Policy</strong><p>Effective: November 20, 2026</p><Link className="text-link" to="/terms">Read our Terms &amp; Conditions <ArrowRight size={15} /></Link></aside>
      <article className="legal-document">
        <p className="legal-intro">This policy explains the information we handle and the choices available to people who use PRERNA. By using the platform, you acknowledge the practices described below.</p>
        {sections.map(([title, text], index) => <section className="legal-block" key={title}><span>{String(index + 1).padStart(2, '0')}</span><div><h2>{title}</h2><p>{text}</p></div></section>)}
      </article>
    </div></section>
  </>;
}

function NotFound({ compact = false }) {
  return <section className={compact ? 'section' : 'not-found-page'}><div className="container"><Empty title="This page isn’t here." text="The link may be out of date, or the page may have moved. Let’s get you back on track." action={<Link className="btn btn-primary" to="/">Back to home <ArrowRight size={16} /></Link>} /></div></section>;
}

export default function App() {
  return <BrowserRouter><ScrollToTop /><Nav /><main><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<Suspense fallback={<div className="container page-content"><LoadingState label="Loading About PRERNA…" /></div>}><About /></Suspense>} />
    <Route path="/projects" element={<Projects />} />
    <Route path="/projects/:slug" element={<ProjectDetails />} />
    <Route path="/team" element={<Team />} />
    <Route path="/problems" element={<Problems />} />
    <Route path="/problems/submit" element={<ProblemSubmit />} />
    <Route path="/join" element={<Join />} />
    <Route path="/profile" element={<ProtectedProfile />} />
    <Route path="/settings" element={<ProtectedProfile settingsOnly />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/terms" element={<TermsAndConditions />} />
    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
    <Route path="*" element={<NotFound />} />
  </Routes></main><Footer /></BrowserRouter>;
}
