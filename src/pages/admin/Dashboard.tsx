import { useState, useEffect } from 'react';
import { 
  Users, 
  HeartHandshake, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  Calendar,
  Sparkles,
  PieChart as PieChartIcon,
  ShoppingBag,
  Heart
} from 'lucide-react';
import { motion } from 'motion/react';
import { churchService } from '../../services/churchService';
import { donorService } from '../../services/donors';
import { expenseService } from '../../services/expenses';
import { projectService } from '../../services/projects';
import { beneficiaryService } from '../../services/beneficiaries';
import { volunteerService } from '../../services/volunteers';
import { reportService } from '../../services/reports';
import { formatCurrency } from '../../lib/currency-utils';
import ConnectionStatus from '../../components/ConnectionStatus';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    beneficiaries: 0,
    donors: 0,
    donations: 0,
    expenses: 0,
    activeProjects: 0,
    volunteers: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [b, d, dns, ex, pr, vl] = await Promise.all([
          beneficiaryService.getBeneficiaries(),
          donorService.getDonors(),
          donorService.getDonations(),
          expenseService.getExpenses(),
          projectService.getProjects(),
          volunteerService.getVolunteers()
        ]);

        const totalDonations = dns.reduce((acc, curr) => acc + curr.amount, 0);
        const totalExpenses = ex.reduce((acc, curr) => acc + curr.amount, 0);

        setStats({
          beneficiaries: b.length,
          donors: d.length,
          donations: totalDonations,
          expenses: totalExpenses,
          activeProjects: pr.filter(p => p.status === 'active').length,
          volunteers: vl.length
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Seeds & Tithes',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const barData = {
    labels: ['Education', 'Healthcare', 'Infrastructure', 'Food', 'Admin'],
    datasets: [
      {
        label: 'Spending by Category',
        data: [15000, 10000, 35000, 8000, 5000],
        backgroundColor: '#4f46e5'
      }
    ]
  };

  const doughnutData = {
    labels: ['Tithe', 'Sacrificial', 'Projects', 'Other'],
    datasets: [
      {
        data: [45, 25, 20, 10],
        backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#64748b'],
        borderWidth: 0
      }
    ]
  };

  const statCards = [
    { name: 'Total Church Family', value: stats.beneficiaries, icon: Users, color: 'indigo', trend: '+12%' },
    { name: 'Tithes & Harvests', value: formatCurrency(stats.donations), icon: Heart, color: 'emerald', trend: '+24%' },
    { name: 'Ministry Spending', value: formatCurrency(stats.expenses), icon: TrendingDown, color: 'rose', trend: '-5%' },
    { name: 'Ministry Workforce', value: stats.volunteers, icon: UserCircleIcon, color: 'amber', trend: '+8%' }
  ];

  function UserCircleIcon(props: any) {
    return <Users {...props} />;
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Administrative Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Real-time ministry impact and financial stewardship tracking.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
             <Calendar className="w-4 h-4 text-slate-400" />
             <span className="text-xs font-medium text-slate-600 dark:text-slate-200">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
           </div>
           <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2">
             <Sparkles className="w-4 h-4" /> AI Summary
           </button>
        </div>
      </div>

      <ConnectionStatus />

      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <motion.div 
            whileHover={{ y: -5 }}
            key={stat.name} 
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500`} />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className={`p-3 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400 rounded-2xl`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${stat.trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-500'}`}>
                {stat.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{stat.name}</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{loading ? '...' : stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Financial Momentum</h3>
              <p className="text-xs text-slate-500 mt-0.5">Seeds & Tithes trajectory across Zomba assemblies.</p>
            </div>
            <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 px-3 py-1.5 outline-none">
              <option>Last 6 Months</option>
              <option>Year to Date</option>
            </select>
          </div>
          <div className="h-[300px]">
            <Line 
              data={lineData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { grid: { display: false }, ticks: { font: { size: 10 } } },
                  x: { grid: { display: false }, ticks: { font: { size: 10 } } }
                }
              }}
            />
          </div>
        </div>

        <div className="lg:col-span-4 bg-[#0b1120] text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
          
          <div>
            <div className="flex items-center gap-2 mb-6">
              <PieChartIcon className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Yield Breakdown</span>
            </div>
            <div className="h-[200px] mb-8">
              <Doughnut 
                data={doughnutData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  cutout: '75%'
                }}
              />
            </div>
          </div>

          <div className="space-y-4">
             {doughnutData.labels.map((label, i) => (
               <div key={label} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: doughnutData.datasets[0].backgroundColor[i] }} />
                    <span className="text-xs font-medium text-slate-400 group-hover:text-white transition-colors">{label}</span>
                  </div>
                  <span className="text-xs font-bold">{doughnutData.datasets[0].data[i]}%</span>
               </div>
             ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Audit Status</span>
            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Verified
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-8">
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
           <h3 className="font-bold text-slate-900 dark:text-white mb-6">Spending Distribution</h3>
           <div className="h-[250px]">
              <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
           </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-900 dark:text-white">Active Outposts</h3>
            <Link to="/admin/projects" className="text-xs font-bold text-indigo-600 hover:underline">See all &rarr;</Link>
          </div>
          <div className="space-y-6">
             {stats.activeProjects > 0 ? (
               <p className="text-sm text-slate-500">Building the sanctuary of Tomorrow...</p>
             ) : (
               <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 border-dashed">
                 <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-xl text-slate-400"><Activity className="w-5 h-5" /></div>
                 <p className="text-xs text-slate-400 font-medium italic">All outposts currently undergoing maintenance.</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Link(props: any) {
  return <a {...props} />;
}
