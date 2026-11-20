import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const COLORS = ['#4c1d95', '#7029c7', '#9b76d1', '#cbb7ec'];

export default function DashboardCharts({ analytics, loading }) {
  const projectStatus = analytics.projectStatus || [];
  const problemStatus = analytics.problemStatus || [];
  return <div className="charts">
    <article><h3>Projects by status</h3><div className="chart">{projectStatus.length
      ? <ResponsiveContainer width="100%" height="100%"><BarChart data={projectStatus}><XAxis dataKey="_id" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="#7029c7" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer>
      : <p className="chart-empty">{loading ? 'Loading analytics…' : 'No project activity to chart yet.'}</p>}</div></article>
    <article><h3>Problem submissions</h3><div className="chart">{problemStatus.length
      ? <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={problemStatus} dataKey="value" nameKey="_id" innerRadius={52} outerRadius={83} label>{problemStatus.map((entry, index) => <Cell key={entry._id || index} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
      : <p className="chart-empty">{loading ? 'Loading analytics…' : 'No problem submissions yet.'}</p>}</div></article>
  </div>;
}
