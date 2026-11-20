import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Activity, ArrowUpRight, Check, ChevronDown, ClipboardCheck, Eye, FolderKanban,
  LayoutDashboard, LogOut, Mail, Menu, Plus, Search, Settings, Trash2, UserPlus,
  Users, X
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const api = axios.create({ baseURL: API, timeout: 20000 });
const authHeaders = token => ({ Authorization: `Bearer ${token}` });
const PROJECT_STATUSES = ['Idea', 'Problem Discovery', 'Research', 'Planning', 'Development', 'Testing', 'Completed', 'On Hold'];
const PROJECT_CATEGORIES = ['Artificial Intelligence', 'Machine Learning', 'Education', 'Healthcare', 'Agriculture', 'Finance', 'Productivity', 'Social Impact', 'Other Innovations'];
const DEPARTMENTS = ['Leadership', 'AI and Backend', 'Frontend and UI/UX', 'Data and Research', 'Testing and Deployment', 'Marketing and Communication', 'Content and Documentation'];
const DashboardCharts = lazy(() => import('./DashboardCharts.jsx'));

function getErrorMessage(error, fallback) {
  return error.response?.data?.message || error.message || fallback;
}

function Login({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await api.post('/auth/login', data);
      localStorage.setItem('prerna_admin', response.data.data.accessToken);
      onLogin(response.data.data.admin);
    } catch (reason) {
      setError(getErrorMessage(reason, 'Unable to sign in.'));
    } finally {
      setLoading(false);
    }
  }
  return <div className="login-page">
    <form onSubmit={submit} className="login-card">
      <div className="admin-logo">P</div><span className="eyebrow">PRERNA Admin</span><h1>Welcome back</h1>
      {error && <div className="error" role="alert">{error}</div>}
      <label>Email address<input name="email" type="email" required autoComplete="username" /></label>
      <label>Password<input name="password" type="password" required autoComplete="current-password" /></label>
      <button className="primary" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
    </form>
  </div>;
}

const NAV_ITEMS = [
  ['Dashboard', LayoutDashboard], ['Projects', FolderKanban], ['Team', Users],
  ['Problems', ClipboardCheck], ['Applications', UserPlus], ['Enquiries', Mail], ['Settings', Settings]
];

function Sidebar({ section, setSection, collapsed, onLogout }) {
  return <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
    <div className="admin-brand"><b>P</b>{!collapsed && <span>PRERNA<small>Admin Console</small></span>}</div>
    <nav aria-label="Admin sections">{NAV_ITEMS.map(([label, Icon]) =>
      <button className={section === label ? 'active' : ''} key={label} onClick={() => setSection(label)} title={collapsed ? label : undefined} aria-current={section === label ? 'page' : undefined}>
        <Icon size={18} /><span>{label}</span>
      </button>)}</nav>
    <button className="logout" onClick={onLogout} title={collapsed ? 'Logout' : undefined}><LogOut size={18} /><span>Logout</span></button>
  </aside>;
}

function useAdminData(path, token) {
  const [result, setResult] = useState({ path: '', version: -1, items: [], error: '' });
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    api.get(path, { headers: authHeaders(token) }).then(response => {
      if (active) setResult({ path, version, items: response.data.data || [], error: '' });
    }).catch(reason => {
      if (active) setResult({ path, version, items: [], error: getErrorMessage(reason, 'Unable to load records.') });
    });
    return () => { active = false; };
  }, [path, token, version]);
  const current = result.path === path && result.version === version;
  return {
    items: current ? result.items : [],
    loading: !current,
    error: current ? result.error : '',
    reload: () => setVersion(value => value + 1)
  };
}

function PageTitle({ eyebrow = 'Management', title, description, children }) {
  return <div className="page-title"><div><span>{eyebrow}</span><h1>{title}</h1>{description && <p>{description}</p>}</div>{children}</div>;
}

function Stat({ label, value, icon: Icon, tone = '' }) {
  return <article className={`stat-card ${tone}`}><span className="stat-icon"><Icon size={18} /></span><span className="stat-label">{label}</span><strong>{value}</strong></article>;
}

function Dashboard({ auth, navigate }) {
  const [result, setResult] = useState({ refresh: -1, data: { stats: {}, analytics: { projectStatus: [], problemStatus: [] }, recent: [] }, error: '' });
  const [refresh, setRefresh] = useState(0);
  const loading = result.refresh !== refresh;
  const data = result.data;
  const error = loading ? '' : result.error;
  useEffect(() => {
    const headers = authHeaders(auth.token);
    let active = true;
    Promise.all([
      api.get('/dashboard/stats', { headers }),
      api.get('/dashboard/analytics', { headers }),
      api.get('/dashboard/recent-activities', { headers })
    ]).then(([stats, analytics, recent]) => {
      if (active) setResult({
        refresh,
        data: {
          stats: stats.data.data || {},
          analytics: analytics.data.data || { projectStatus: [], problemStatus: [] },
          recent: recent.data.data || []
        },
        error: ''
      });
    }).catch(reason => {
      if (active) setResult(current => ({ ...current, refresh, error: getErrorMessage(reason, 'Unable to load dashboard data.') }));
    });
    return () => { active = false; };
  }, [auth.token, refresh]);

  return <>
    <PageTitle eyebrow="Overview" title="Dashboard" description="A snapshot of what is happening across the collective.">
      <button className="secondary-button" onClick={() => setRefresh(value => value + 1)} disabled={loading}>Refresh</button>
    </PageTitle>
    {error && <ErrorBanner message={error} onRetry={() => setRefresh(value => value + 1)} />}
    <div className="stats-grid-admin">
      <Stat label="Community members" value={loading ? '—' : data.stats.members ?? 0} icon={Users} />
      <Stat label="Active projects" value={loading ? '—' : data.stats.activeProjects ?? 0} icon={FolderKanban} />
      <Stat label="Completed projects" value={loading ? '—' : data.stats.completedProjects ?? 0} icon={Check} />
      <Stat label="Pending applications" value={loading ? '—' : data.stats.pendingApplications ?? 0} icon={UserPlus} tone="stat-warm" />
    </div>
    <div className="dashboard-quick-links">
      <button onClick={() => navigate('Projects')}><Plus size={16} />Create a project</button>
      <button onClick={() => navigate('Problems')}><ClipboardCheck size={16} />Review problem statements</button>
      <button onClick={() => navigate('Applications')}><UserPlus size={16} />Review applications</button>
    </div>
    <Suspense fallback={<div className="charts"><article><div className="chart-empty">Loading analytics…</div></article><article><div className="chart-empty">Loading analytics…</div></article></div>}>
      <DashboardCharts analytics={data.analytics} loading={loading} />
    </Suspense>
    <article className="table-card"><div className="card-heading"><div><h3>Recent activity</h3><p>Latest changes made in the admin console.</p></div><Activity size={18} /></div>
      {data.recent.length ? <div className="table-scroll"><table><thead><tr><th>Action</th><th>Entity</th><th>By</th><th>Date</th></tr></thead><tbody>{data.recent.map(entry => <tr key={entry._id}><td><span className="activity-action">{entry.action}</span></td><td>{entry.entity}</td><td>{entry.actor?.name || 'Admin'}</td><td>{new Date(entry.createdAt).toLocaleString()}</td></tr>)}</tbody></table></div>
        : <p className="empty-admin">{loading ? 'Loading activity…' : 'No recorded activity yet.'}</p>}
    </article>
  </>;
}

function ErrorBanner({ message, onRetry }) {
  return <div className="error" role="alert"><span>{message}</span>{onRetry && <button onClick={onRetry}>Retry</button>}</div>;
}

function RecordModal({ title, fields, record, auth, onClose, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isEditing = Boolean(record?._id);
  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = new FormData();
    for (const field of fields) {
      if (field.type === 'file') {
        const files = form.elements[field.name].files;
        if (field.multiple) Array.from(files).forEach(file => payload.append(field.name, file));
        else if (files[0]) payload.append(field.name, files[0]);
        continue;
      }
      if (field.type === 'checkbox') {
        payload.append(field.name, form.elements[field.name].checked);
        continue;
      }
      const value = formData.get(field.name);
      if (value !== null) payload.append(field.name, value);
    }
    try {
      const config = { headers: { ...authHeaders(auth.token), 'Content-Type': 'multipart/form-data' } };
      if (isEditing) await api.put(`${record.endpoint}/${record._id}`, payload, config);
      else await api.post(record.endpoint, payload, config);
      onSaved();
    } catch (reason) {
      setError(getErrorMessage(reason, `Unable to ${isEditing ? 'save' : 'create'} this ${title.toLowerCase()}.`));
    } finally {
      setSaving(false);
    }
  }
  return <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="record-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-heading"><div><span className="eyebrow">{isEditing ? 'Edit record' : 'New record'}</span><h2 id="modal-title">{isEditing ? `Edit ${title}` : `Create ${title}`}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button></div>
      <form className="record-form" onSubmit={submit}>
        {error && <ErrorBanner message={error} />}
        <div className="record-form-grid">{fields.map(field => <FieldInput key={field.name} field={field} record={record} />)}</div>
        <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose} disabled={saving}>Cancel</button><button className="primary" disabled={saving}>{saving ? 'Saving…' : isEditing ? 'Save changes' : `Create ${title}`}</button></div>
      </form>
    </section>
  </div>;
}

function FieldInput({ field, record }) {
  const value = record?.[field.name];
  const formattedValue = Array.isArray(value)
    ? value.map(entry => typeof entry === 'object' && entry !== null ? entry._id || entry.name || '' : entry).join(', ')
    : value ?? field.defaultValue ?? '';
  if (field.type === 'checkbox') return <label className="form-check"><input name={field.name} type="checkbox" defaultChecked={Boolean(value)} /><span>{field.label}</span></label>;
  if (field.type === 'textarea') return <label className={`form-field ${field.wide ? 'field-wide' : ''}`}>{field.label}<textarea name={field.name} rows={field.rows || 3} required={field.required} defaultValue={formattedValue} placeholder={field.placeholder} /></label>;
  if (field.type === 'select') return <label className="form-field">{field.label}<select name={field.name} required={field.required} defaultValue={value ?? field.defaultValue ?? ''}>{!field.required && <option value="">—</option>}{field.options.map(option => <option value={option.value ?? option} key={option.value ?? option}>{option.label ?? option}</option>)}</select></label>;
  if (field.type === 'file') return <label className="form-field">{field.label}<input name={field.name} type="file" accept={field.accept} multiple={field.multiple} />{value && <small className="field-note">Current file: {String(value).split('/').pop()}</small>}</label>;
  return <label className={`form-field ${field.wide ? 'field-wide' : ''}`}>{field.label}<input name={field.name} type={field.type || 'text'} required={field.required} min={field.min} max={field.max} defaultValue={formattedValue} placeholder={field.placeholder} /></label>;
}

function DetailModal({ title, item, fields, onClose }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="record-modal detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title">
      <div className="modal-heading"><div><span className="eyebrow">Record details</span><h2 id="detail-title">{title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button></div>
      <dl className="detail-list">{fields.map(field => <div key={field.key}><dt>{field.label}</dt><dd>{renderDetail(item[field.key], field.key)}</dd></div>)}</dl>
    </section>
  </div>;
}

function renderDetail(value, key) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (key === 'resumeUrl' && typeof value === 'string' && value.startsWith('/uploads/')) {
    return <a href={`${API.replace(/\/api\/?$/, '')}${value}`} target="_blank" rel="noreferrer">Open resume <ArrowUpRight size={13} /></a>;
  }
  if (Array.isArray(value)) return value.map(entry => typeof entry === 'object' ? entry.name || entry.title || JSON.stringify(entry) : entry).join(', ') || '—';
  if (typeof value === 'object') return value.name || JSON.stringify(value);
  return String(value);
}

function TablePage({ title, path, auth, columns, fields, details, createLabel, endpoint }) {
  const { items, loading, error, reload } = useAdminData(path, auth.token);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState('');
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query ? items.filter(item => JSON.stringify(item).toLowerCase().includes(query)) : items;
  }, [items, search]);

  async function update(item, body) {
    setActionError('');
    setBusy(item._id);
    try {
      await api.put(`${endpoint}/${item._id}`, body, { headers: authHeaders(auth.token) });
      reload();
    } catch (reason) {
      setActionError(getErrorMessage(reason, 'Unable to update this record.'));
    } finally {
      setBusy('');
    }
  }
  async function remove(item) {
    if (!window.confirm(`Delete "${item.name || item.title || item.fullName || item.subject || 'this record'}"? This cannot be undone.`)) return;
    setActionError('');
    setBusy(item._id);
    try {
      await api.delete(`${endpoint}/${item._id}`, { headers: authHeaders(auth.token) });
      reload();
    } catch (reason) {
      setActionError(getErrorMessage(reason, 'Unable to delete this record.'));
    } finally {
      setBusy('');
    }
  }
  function save() { setEditing(null); reload(); }

  return <>
    <PageTitle title={title} description={`${items.length} ${items.length === 1 ? 'record' : 'records'} · Search, review, and manage ${title.toLowerCase()}.`}>
      {fields && <button className="primary" onClick={() => setEditing({ endpoint })}><Plus size={16} />{createLabel || `Add ${title.replace(/s$/, '')}`}</button>}
    </PageTitle>
    <div className="management-toolbar">
      <label className="search-box"><Search size={16} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder={`Search ${title.toLowerCase()}…`} /></label>
      <span>{loading ? 'Loading…' : `${filtered.length} shown`}</span>
    </div>
    {(error || actionError) && <ErrorBanner message={actionError || error} onRetry={error ? reload : undefined} />}
    <article className="table-card">
      {loading ? <p className="empty-admin">Loading {title.toLowerCase()}…</p> : filtered.length ? <div className="table-scroll"><table><thead><tr>{columns.map(column => <th key={column.key}>{column.label}</th>)}<th className="actions-heading">Actions</th></tr></thead>
        <tbody>{filtered.map(item => <tr key={item._id}>{columns.map(column => <td key={column.key}>{column.render ? column.render(item, update, busy === item._id) : renderDetail(item[column.key])}</td>)}
          <td><div className="row-actions">
            <button className="icon-button" title="View details" aria-label="View details" onClick={() => setViewing(item)}><Eye size={16} /></button>
            {fields && <button className="icon-button" title="Edit record" aria-label="Edit record" onClick={() => setEditing({ ...item, endpoint })}><Settings size={16} /></button>}
            <button className="icon-button danger-action" title="Delete record" aria-label="Delete record" disabled={busy === item._id} onClick={() => remove(item)}><Trash2 size={16} /></button>
          </div></td>
        </tr>)}</tbody></table></div> : <p className="empty-admin">{search ? 'No records match this search.' : `No ${title.toLowerCase()} to show yet.`}</p>}
    </article>
    {editing && <RecordModal title={title.replace(/s$/, '')} fields={fields} record={editing} auth={auth} onClose={() => setEditing(null)} onSaved={save} />}
    {viewing && <DetailModal title={viewing.name || viewing.title || viewing.fullName || viewing.subject || title} item={viewing} fields={details} onClose={() => setViewing(null)} />}
  </>;
}

const PROJECT_FIELDS = [
  { name: 'name', label: 'Project name', required: true },
  { name: 'slug', label: 'URL slug', required: true, placeholder: 'unique-project-name' },
  { name: 'domain', label: 'Domain', required: true, placeholder: 'Healthcare, Education…' },
  { name: 'category', label: 'Category', type: 'select', required: true, options: PROJECT_CATEGORIES },
  { name: 'status', label: 'Status', type: 'select', options: PROJECT_STATUSES, defaultValue: 'Idea' },
  { name: 'progress', label: 'Progress (%)', type: 'number', min: 0, max: 100, defaultValue: 0 },
  { name: 'description', label: 'Short description', type: 'textarea', required: true, wide: true, rows: 3 },
  { name: 'overview', label: 'Overview', type: 'textarea', wide: true },
  { name: 'problemStatement', label: 'Problem statement', type: 'textarea', wide: true },
  { name: 'whyItMatters', label: 'Why it matters', type: 'textarea', wide: true },
  { name: 'proposedSolution', label: 'Proposed solution', type: 'textarea', wide: true },
  { name: 'keyFeatures', label: 'Key features (comma separated)', type: 'textarea', wide: true },
  { name: 'targetAudience', label: 'Target audience (comma separated)' },
  { name: 'technologyStack', label: 'Technology stack (comma separated)' },
  { name: 'futureImprovements', label: 'Future improvements (comma separated)', wide: true },
  { name: 'teamMembers', label: 'Team member IDs (comma separated)', wide: true },
  { name: 'demoUrl', label: 'Demo URL', type: 'url' },
  { name: 'githubUrl', label: 'GitHub URL', type: 'url' },
  { name: 'thumbnail', label: 'Thumbnail image', type: 'file', accept: 'image/png,image/jpeg,image/webp' },
  { name: 'images', label: 'Project images', type: 'file', accept: 'image/png,image/jpeg,image/webp', multiple: true },
  { name: 'featured', label: 'Feature on the public homepage', type: 'checkbox' },
  { name: 'published', label: 'Publish this project publicly', type: 'checkbox' }
];
const TEAM_FIELDS = [
  { name: 'name', label: 'Full name', required: true },
  { name: 'role', label: 'Role', required: true },
  { name: 'department', label: 'Department', type: 'select', required: true, options: DEPARTMENTS },
  { name: 'bio', label: 'Biography', type: 'textarea', wide: true },
  { name: 'skills', label: 'Skills (comma separated)', type: 'textarea', wide: true },
  { name: 'linkedinUrl', label: 'LinkedIn URL', type: 'url' },
  { name: 'githubUrl', label: 'GitHub URL', type: 'url' },
  { name: 'portfolioUrl', label: 'Portfolio URL', type: 'url' },
  { name: 'image', label: 'Profile image', type: 'file', accept: 'image/png,image/jpeg,image/webp' },
  { name: 'leadership', label: 'Show as a community lead', type: 'checkbox' },
  { name: 'active', label: 'Show on the public team page', type: 'checkbox' }
];
const PROBLEM_FIELDS = [
  { name: 'approvalStatus', label: 'Approval', type: 'select', options: ['pending', 'approved', 'rejected'] },
  { name: 'researchStatus', label: 'Research status', type: 'select', options: ['Submitted', 'Under Review', 'In Research', 'Validated', 'Converted'] },
  { name: 'rejectionReason', label: 'Review notes', type: 'textarea', wide: true }
];
const APPLICATION_FIELDS = [
  { name: 'status', label: 'Application status', type: 'select', options: ['pending', 'accepted', 'rejected'] },
  { name: 'internalNotes', label: 'Internal notes', type: 'textarea', wide: true }
];
function StatusSelect({ item, value, options, update, saving, keyName = 'status' }) {
  return <label className="status-control"><select aria-label={`Set ${keyName}`} disabled={saving} value={item[keyName] ?? value} onChange={event => update(item, { [keyName]: event.target.value })}>{options.map(option => <option key={option}>{option}</option>)}</select><ChevronDown size={13} /></label>;
}

function ProjectsPage({ auth }) {
  return <TablePage title="Projects" path="/projects?published=false&limit=50" endpoint="/projects" auth={auth} fields={PROJECT_FIELDS} createLabel="New project"
    columns={[
      { key: 'name', label: 'Project' }, { key: 'domain', label: 'Domain' }, { key: 'status', label: 'Stage', render: (item, update, saving) => <StatusSelect item={item} value="Idea" options={PROJECT_STATUSES} update={update} saving={saving} /> },
      { key: 'published', label: 'Visibility', render: (item, update, saving) => <button className={`visibility-toggle ${item.published ? 'is-published' : ''}`} disabled={saving} onClick={() => update(item, { published: !item.published })}>{item.published ? 'Published' : 'Draft'}</button> }
    ]}
    details={[
      { key: 'name', label: 'Project' }, { key: 'slug', label: 'Slug' }, { key: 'description', label: 'Description' }, { key: 'overview', label: 'Overview' },
      { key: 'domain', label: 'Domain' }, { key: 'category', label: 'Category' }, { key: 'status', label: 'Status' }, { key: 'progress', label: 'Progress' },
      { key: 'technologyStack', label: 'Technology' }, { key: 'keyFeatures', label: 'Features' }, { key: 'targetAudience', label: 'Audience' }, { key: 'featured', label: 'Featured' }, { key: 'published', label: 'Published' }
    ]} />;
}

function TeamPage({ auth }) {
  return <TablePage title="Team" path="/team/admin" endpoint="/team" auth={auth} fields={TEAM_FIELDS} createLabel="Add member"
    columns={[
      { key: 'name', label: 'Member' }, { key: 'role', label: 'Role' }, { key: 'department', label: 'Department' },
      { key: 'active', label: 'Visibility', render: (item, update, saving) => <button className={`visibility-toggle ${item.active ? 'is-published' : ''}`} disabled={saving} onClick={() => update(item, { active: !item.active })}>{item.active ? 'Active' : 'Hidden'}</button> }
    ]}
    details={[
      { key: 'name', label: 'Name' }, { key: 'role', label: 'Role' }, { key: 'department', label: 'Department' }, { key: 'bio', label: 'Biography' },
      { key: 'skills', label: 'Skills' }, { key: 'linkedinUrl', label: 'LinkedIn' }, { key: 'githubUrl', label: 'GitHub' }, { key: 'portfolioUrl', label: 'Portfolio' },
      { key: 'leadership', label: 'Community lead' }, { key: 'active', label: 'Public profile' }
    ]} />;
}

function ProblemsPage({ auth }) {
  return <TablePage title="Problem Statements" path="/problems/admin" endpoint="/problems" auth={auth} fields={PROBLEM_FIELDS}
    columns={[
      { key: 'title', label: 'Problem' }, { key: 'domain', label: 'Domain' },
      { key: 'approvalStatus', label: 'Approval', render: (item, update, saving) => <StatusSelect item={item} options={['pending', 'approved', 'rejected']} update={update} saving={saving} keyName="approvalStatus" /> },
      { key: 'researchStatus', label: 'Research', render: (item, update, saving) => <StatusSelect item={item} options={['Submitted', 'Under Review', 'In Research', 'Validated', 'Converted']} update={update} saving={saving} keyName="researchStatus" /> }
    ]}
    details={[
      { key: 'title', label: 'Problem' }, { key: 'description', label: 'Description' }, { key: 'domain', label: 'Domain' },
      { key: 'location', label: 'Location' }, { key: 'affectedPeople', label: 'Who is affected' }, { key: 'evidence', label: 'Evidence' },
      { key: 'submittedBy', label: 'Submitted by' }, { key: 'submittedByEmail', label: 'Email' }, { key: 'approvalStatus', label: 'Approval' },
      { key: 'researchStatus', label: 'Research status' }, { key: 'rejectionReason', label: 'Review notes' }
    ]} />;
}

function ApplicationsPage({ auth }) {
  return <TablePage title="Applications" path="/applications" endpoint="/applications" auth={auth} fields={APPLICATION_FIELDS}
    columns={[
      { key: 'fullName', label: 'Applicant' }, { key: 'email', label: 'Email' }, { key: 'preferredDepartment', label: 'Department' },
      { key: 'status', label: 'Status', render: (item, update, saving) => <StatusSelect item={item} value="pending" options={['pending', 'accepted', 'rejected']} update={update} saving={saving} /> }
    ]}
    details={[
      { key: 'fullName', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'phone', label: 'Phone' }, { key: 'college', label: 'College' },
      { key: 'course', label: 'Course' }, { key: 'yearOfStudy', label: 'Year' }, { key: 'state', label: 'State' },
      { key: 'preferredDepartment', label: 'Department' }, { key: 'weeklyAvailability', label: 'Availability' },
      { key: 'skills', label: 'Skills' }, { key: 'areasOfInterest', label: 'Interests' }, { key: 'motivation', label: 'Motivation' },
      { key: 'linkedinUrl', label: 'LinkedIn' }, { key: 'githubUrl', label: 'GitHub' }, { key: 'resumeUrl', label: 'Resume' },
      { key: 'status', label: 'Status' }, { key: 'internalNotes', label: 'Internal notes' }
    ]} />;
}

function EnquiriesPage({ auth }) {
  return <TablePage title="Enquiries" path="/contact" endpoint="/contact" auth={auth}
    columns={[
      { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'subject', label: 'Subject' },
      { key: 'enquiryType', label: 'Type' },
      { key: 'resolved', label: 'Status', render: (item, update, saving) => <button className={`visibility-toggle ${item.resolved ? 'is-published' : ''}`} disabled={saving} onClick={() => update(item, { resolved: !item.resolved })}>{item.resolved ? 'Resolved' : 'Open'}</button> }
    ]}
    details={[
      { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'enquiryType', label: 'Type' },
      { key: 'subject', label: 'Subject' }, { key: 'message', label: 'Message' }, { key: 'resolved', label: 'Resolved' },
      { key: 'createdAt', label: 'Received' }
    ]} />;
}

const DEFAULT_SETTINGS = {
  organizationName: '',
  tagline: '',
  description: '',
  contactEmail: '',
  socialLinks: { linkedin: '', instagram: '', github: '', youtube: '' },
  seo: { title: '', description: '' },
  homepageStats: { communityMembers: 0, activeProjects: 0, completedProjects: 0, collaborations: 0 }
};

function SettingsPage({ auth }) {
  const [result, setResult] = useState({ version: -1, settings: null, error: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [version, setVersion] = useState(0);
  const loading = result.version !== version;
  const settings = result.settings;
  const error = loading ? '' : result.error;
  useEffect(() => {
    let active = true;
    api.get('/settings', { headers: authHeaders(auth.token) }).then(response => {
      const payload = response.data.data;
      if (active) setResult({
        version,
        settings: { ...DEFAULT_SETTINGS, ...payload, socialLinks: { ...DEFAULT_SETTINGS.socialLinks, ...payload?.socialLinks }, seo: { ...DEFAULT_SETTINGS.seo, ...payload?.seo }, homepageStats: { ...DEFAULT_SETTINGS.homepageStats, ...payload?.homepageStats } },
        error: ''
      });
    }).catch(reason => { if (active) setResult({ version, settings: null, error: getErrorMessage(reason, 'Unable to load settings.') }); });
    return () => { active = false; };
  }, [auth.token, version]);
  async function submit(event) {
    event.preventDefault();
    setSaving(true); setSaved(false);
    const form = new FormData(event.currentTarget);
    const data = {
      organizationName: form.get('organizationName'),
      tagline: form.get('tagline'),
      description: form.get('description'),
      contactEmail: form.get('contactEmail'),
      socialLinks: Object.fromEntries(['linkedin', 'instagram', 'github', 'youtube'].map(key => [key, form.get(`socialLinks.${key}`)])),
      seo: Object.fromEntries(['title', 'description'].map(key => [key, form.get(`seo.${key}`)])),
      homepageStats: Object.fromEntries(['communityMembers', 'activeProjects', 'completedProjects', 'collaborations'].map(key => [key, Number(form.get(`homepageStats.${key}`)) || 0]))
    };
    try {
      const response = await api.put('/settings', data, { headers: authHeaders(auth.token) });
      setResult({ version, settings: response.data.data, error: '' });
      setSaved(true);
    } catch (reason) {
      setResult(current => ({ ...current, error: getErrorMessage(reason, 'Unable to save settings.') }));
    } finally { setSaving(false); }
  }
  if (loading) return <><PageTitle eyebrow="Configuration" title="Settings" /><p className="empty-admin">Loading organization settings…</p></>;
  if (!settings) return <><PageTitle eyebrow="Configuration" title="Settings" /><ErrorBanner message={error || 'Settings are unavailable.'} onRetry={() => setVersion(value => value + 1)} /></>;
  return <>
    <PageTitle eyebrow="Configuration" title="Settings" description="Manage public organization information, social profiles, and homepage statistics." />
    <form className="settings-card settings-form" onSubmit={submit}>
      {saved && <div className="success" role="status">Settings saved successfully.</div>}
      {error && <ErrorBanner message={error} />}
      <section><h2>Organization</h2><p>Public-facing identity and contact information.</p>
        <label>Organization name<input name="organizationName" required defaultValue={settings.organizationName} /></label>
        <label>Tagline<input name="tagline" defaultValue={settings.tagline} /></label>
        <label>Description<textarea name="description" rows="3" defaultValue={settings.description || ''} /></label>
        <label>Contact email<input name="contactEmail" type="email" defaultValue={settings.contactEmail || ''} /></label>
      </section>
      <section><h2>Social links</h2><p>Leave a field blank to hide its link.</p><div className="settings-grid">
        {['linkedin', 'instagram', 'github', 'youtube'].map(key => <label key={key}>{key[0].toUpperCase() + key.slice(1)} URL<input name={`socialLinks.${key}`} type="url" defaultValue={settings.socialLinks[key] || ''} /></label>)}
      </div></section>
      <section><h2>Homepage statistics</h2><p>Update the figures displayed on the public homepage.</p><div className="settings-grid">
        {[['communityMembers', 'Community members'], ['activeProjects', 'Active projects'], ['completedProjects', 'Completed projects'], ['collaborations', 'Collaborations']].map(([key, label]) => <label key={key}>{label}<input name={`homepageStats.${key}`} type="number" min="0" defaultValue={settings.homepageStats[key] ?? 0} /></label>)}
      </div></section>
      <section><h2>Search appearance</h2><p>Metadata shown when sharing the website.</p>
        <label>Page title<input name="seo.title" defaultValue={settings.seo.title || ''} /></label>
        <label>Meta description<textarea name="seo.description" rows="3" defaultValue={settings.seo.description || ''} /></label>
      </section>
      <button className="primary" disabled={saving}>{saving ? 'Saving…' : 'Save settings'}</button>
    </form>
  </>;
}

export default function App() {
  const [section, setSection] = useState('Dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('prerna_admin');
    return token ? { token, admin: null } : null;
  });
  useEffect(() => {
    if (!auth?.token || auth.admin) return undefined;
    let active = true;
    api.get('/auth/me', { headers: authHeaders(auth.token) }).then(response => {
      if (active) setAuth(current => current?.token === auth.token ? { token: auth.token, admin: response.data.data } : current);
    }).catch(() => {
      localStorage.removeItem('prerna_admin');
      if (active) setAuth(null);
    });
    return () => { active = false; };
  }, [auth?.token, auth?.admin]);
  function logout() { localStorage.removeItem('prerna_admin'); setAuth(null); }
  if (!auth) return <Login onLogin={admin => setAuth({ token: localStorage.getItem('prerna_admin'), admin })} />;
  if (!auth.admin) return <div className="login-page"><p className="empty-admin">Verifying admin session…</p></div>;

  const content = {
    Dashboard: <Dashboard auth={auth} navigate={setSection} />,
    Projects: <ProjectsPage auth={auth} />,
    Team: <TeamPage auth={auth} />,
    Problems: <ProblemsPage auth={auth} />,
    Applications: <ApplicationsPage auth={auth} />,
    Enquiries: <EnquiriesPage auth={auth} />,
    Settings: <SettingsPage auth={auth} />
  }[section];
  return <div className="admin-app">
    <Sidebar section={section} setSection={setSection} collapsed={collapsed} onLogout={logout} />
    <main>
      <header className="topbar"><button onClick={() => setCollapsed(value => !value)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}><Menu /></button><div><b>{auth.admin.name || 'Administrator'}</b><small>{auth.admin.role?.replace('_', ' ') || 'Admin'}</small></div></header>
      <div className="admin-content">{content}</div>
    </main>
  </div>;
}
