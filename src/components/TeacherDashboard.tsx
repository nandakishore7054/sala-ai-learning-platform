import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { db, auth } from '../firebase';
import {
  collection,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import {
  Users,
  Loader2,
  BarChart3,
  PieChart as PieChartIcon,
  Trophy,
  CheckCircle,
  Star,
  Medal,
  Activity,
  Lightbulb,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function TeacherDashboard() {
  const [loading, setLoading] = useState(true);
  const [styleData, setStyleData] = useState<{ name: string; value: number }[]>([]);
  const [badgeData, setBadgeData] = useState<{ name: string; value: number }[]>([]);
  const [moduleProgressData, setModuleProgressData] = useState<{ name: string; progress: number }[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [engagementScore, setEngagementScore] = useState(0);
  const [topStudents, setTopStudents] = useState<{ name: string; score: number }[]>([]);
  const [aiInsight, setAiInsight] = useState('');
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAggregatedData = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        // 1. Fetch Students
        let usersSnap;
        try {
          const usersQuery = query(collection(db, 'users'), where('role', '==', 'student'));
          usersSnap = await getDocs(usersQuery);
        } catch (err) {
          handleFirestoreError(err, OperationType.LIST, 'users');
          return;
        }
        const students = usersSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
        setTotalStudents(students.length);

        // 2. Learning Style Distribution
        const styleCounts: Record<string, number> = { visual: 0, auditory: 0, kinesthetic: 0 };
        students.forEach((user: any) => {
          if (user.learningStyle && styleCounts[user.learningStyle] !== undefined) {
            styleCounts[user.learningStyle]++;
          }
        });
        setStyleData(Object.entries(styleCounts).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value
        })));

        // 3. Badge Distribution
        const badgeCounts: Record<string, number> = { Bronze: 0, Silver: 0, Gold: 0, Master: 0 };
        students.forEach((user: any) => {
          if (user.badges && Array.isArray(user.badges)) {
            user.badges.forEach((badge: string) => {
              const key = badge.split(' ')[0];
              if (badgeCounts[key] !== undefined) {
                badgeCounts[key]++;
              }
            });
          }
        });
        setBadgeData(Object.entries(badgeCounts).map(([name, value]) => ({ name, value })));

        // 4. Progress & Engagement
        let progressSnap;
        try {
          progressSnap = await getDocs(collection(db, 'progress'));
        } catch (err) {
          handleFirestoreError(err, OperationType.LIST, 'progress');
          return;
        }
        const progressDocs = progressSnap.docs.map(doc => doc.data());
        const completedCoursesCount = progressDocs.filter(p => p.completed).length;

        let pathsSnap;
        try {
          pathsSnap = await getDocs(collection(db, 'learning_paths'));
        } catch (err) {
          handleFirestoreError(err, OperationType.LIST, 'learning_paths');
          return;
        }
        const pathsDocs = pathsSnap.docs.map(doc => doc.data());

        const moduleMeta: Record<string, { title: string; totalCourses: number }> = {};
        let totalCoursesAvailable = 0;

        pathsDocs.forEach((docData: any) => {
          const modulesToProcess = docData.modules && Array.isArray(docData.modules)
            ? docData.modules
            : [docData];

          modulesToProcess.forEach((m: any) => {
            if (m.module_id) {
              const count = m.courses?.length || 0;
              moduleMeta[m.module_id] = {
                title: m.module_title || 'Untitled Module',
                totalCourses: count
              };
              totalCoursesAvailable += count;
            }
          });
        });

        // Engagement Score
        if (totalCoursesAvailable > 0 && students.length > 0) {
          const totalPossibleCompletions = totalCoursesAvailable * students.length;
          setEngagementScore(Math.round((completedCoursesCount / totalPossibleCompletions) * 100));
        } else {
          setEngagementScore(0);
        }

        // Module Progress
        const studentModuleProgress: Record<string, Record<string, number>> = {};
        progressDocs.forEach((p: any) => {
          if (p.completed && p.moduleId && p.userId) {
            if (!studentModuleProgress[p.moduleId]) studentModuleProgress[p.moduleId] = {};
            if (!studentModuleProgress[p.moduleId][p.userId]) studentModuleProgress[p.moduleId][p.userId] = 0;
            studentModuleProgress[p.moduleId][p.userId]++;
          }
        });

        const barData = Object.entries(moduleMeta).map(([mId, meta]) => {
          const studentProgressInModule = studentModuleProgress[mId] || {};
          if (students.length === 0 || meta.totalCourses === 0) return { name: meta.title, progress: 0 };

          let totalPercentage = 0;
          students.forEach((s: any) => {
            const completed = studentProgressInModule[s.uid] || 0;
            const percent = Math.min((completed / meta.totalCourses) * 100, 100);
            totalPercentage += percent;
          });

          return {
            name: meta.title,
            progress: Math.round(totalPercentage / students.length)
          };
        }).sort((a, b) => b.progress - a.progress);

        setModuleProgressData(barData.length > 0 ? barData : [{ name: 'No Modules', progress: 0 }]);

        // 5. Top Performing Students
        let quizSnap;
        try {
          quizSnap = await getDocs(collection(db, 'quizResults'));
        } catch (err) {
          handleFirestoreError(err, OperationType.LIST, 'quizResults');
          return;
        }
        const quizDocs = quizSnap.docs.map(doc => doc.data());

        const studentScores: Record<string, { total: number; count: number; name: string }> = {};
        quizDocs.forEach((q: any) => {
          if (!studentScores[q.userId]) {
            const student: any = students.find((s: any) => s.uid === q.userId);
            studentScores[q.userId] = { total: 0, count: 0, name: student?.displayName || student?.name || 'Unknown Student' };
          }
          const scorePercent = (q.score / (q.totalQuestions || 5)) * 100;
          studentScores[q.userId].total += scorePercent;
          studentScores[q.userId].count++;
        });

        const sortedStudents = Object.values(studentScores)
          .map(s => ({ name: s.name, score: Math.round(s.total / s.count) }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 3);
        setTopStudents(sortedStudents);

        // 6. AI Insight
        if (barData.length > 0) {
          const topModule = barData[0];
          const lowModule = barData[barData.length - 1];
          const insight = `Students are mastering "${topModule.name}" (${topModule.progress}%) significantly faster than "${lowModule.name}" (${lowModule.progress}%). Consider adding more visual aids to the latter.`;
          setAiInsight(insight);
        }

      } catch (error: any) {
        console.error("Error fetching aggregated data:", error);
        setFetchError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAggregatedData();
  }, []);

  const COLORS = ['#6366f1', '#a855f7', '#f97316', '#10b981'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-slate-50 dark:bg-[#071028]">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
        <p className="text-slate-500 font-medium animate-pulse">Aggregating platform analytics...</p>
      </div>
    );
  }

  return (
    <div className="relative max-w-7xl mx-auto px-4 py-8 space-y-8 min-h-screen overflow-hidden">

      {/* Background Glow Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="absolute right-0 top-1/3 w-[30rem] h-[30rem] bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="absolute bottom-0 left-1/3 w-[25rem] h-[25rem] bg-violet-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 p-10 shadow-[0_20px_80px_rgba(79,70,229,0.35)]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_30%)]" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">

            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl text-white/90 text-sm font-semibold mb-5">
                <Activity size={16} />
                AI Analytics Workspace
              </div>

              <h1 className="text-5xl md:text-6xl font-black text-white leading-tight tracking-tight">
                Teacher Intelligence Dashboard
              </h1>

              <p className="mt-5 text-lg text-indigo-100 max-w-2xl leading-relaxed">
                Monitor student engagement, learning patterns, weak topics,
                and adaptive AI learning analytics in one premium workspace.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 min-w-[280px]">

              <div className="glass-dark rounded-3xl p-5">
                <p className="text-indigo-200 text-sm font-medium">Total Students</p>
                <h2 className="text-4xl font-black text-white mt-2">
                  {totalStudents}
                </h2>
              </div>

              <div className="glass-dark rounded-3xl p-5">
                <p className="text-cyan-200 text-sm font-medium">Engagement</p>
                <h2 className="text-4xl font-black text-white mt-2">
                  {engagementScore}%
                </h2>
              </div>

            </div>
          </div>
        </motion.div>

        {fetchError && (
          <div className="bg-red-50 border border-red-200 p-6 rounded-[2rem] flex items-start gap-4 text-red-700">
            <AlertCircle className="shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-lg">Data Fetching Error</h3>
              <p className="text-sm opacity-90 mb-2">There was a problem loading the student analytics. This usually happens due to permission restrictions or network issues.</p>
              <div className="bg-white/50 p-3 rounded-xl font-mono text-[10px] break-all">
                {fetchError}
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white dark:bg-slate-900/70 backdrop-blur-2xl p-7 shadow-[0_10px_40px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_25px_80px_rgba(79,70,229,0.18)]">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Users size={24} />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Students</span>
            </div>
            <p className="text-4xl font-black text-slate-900 text-slate-900 dark:text-white">{totalStudents}</p>
          </div>

          <div className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white dark:bg-slate-900/70 backdrop-blur-2xl p-7 shadow-[0_10px_40px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_25px_80px_rgba(79,70,229,0.18)]">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <Activity size={24} />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Engagement</span>
            </div>
            <p className="text-4xl font-black text-slate-900 text-slate-900 dark:text-white">{engagementScore}%</p>
          </div>

          <div className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white dark:bg-slate-900/70 backdrop-blur-2xl p-7 shadow-[0_10px_40px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_25px_80px_rgba(79,70,229,0.18)]">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <Trophy size={24} />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Top Avg Score</span>
            </div>
            <p className="text-4xl font-black text-slate-900 text-slate-900 dark:text-white">{topStudents[0]?.score || 0}%</p>
          </div>

          <div className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white dark:bg-slate-900/70 backdrop-blur-2xl p-7 shadow-[0_10px_40px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_25px_80px_rgba(79,70,229,0.18)]">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                <TrendingUp size={24} />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Modules</span>
            </div>
            <p className="text-4xl font-black text-slate-900 text-slate-900 dark:text-white">{moduleProgressData.length}</p>
          </div>
        </div>

        {/* AI Insight Card */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="relative overflow-hidden rounded-[2.5rem] border border-indigo-400/20 bg-gradient-to-br from-[#0f172a] via-indigo-950 to-violet-950 p-10 text-white shadow-[0_20px_80px_rgba(79,70,229,0.25)]"
        >
          <div className="absolute inset-0 bg-black/20" />

          <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/20 blur-3xl rounded-full" />

          <div className="relative z-10 flex flex-col md:flex-row items-start gap-6">

            <div className="p-4 bg-white/10 rounded-2xl">
              <Lightbulb size={32} className="text-indigo-200" />
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2 text-white">
                AI Learning Insight
              </h3>

              <p className="text-xl font-semibold leading-relaxed text-white/95 tracking-wide">
                {aiInsight || "Collecting more data to generate insights..."}
              </p>
            </div>

          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Module Progress - Bar Chart */}
          <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white dark:bg-slate-900/70 backdrop-blur-2xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.08)] transition-all duration-500 hover:shadow-[0_20px_80px_rgba(79,70,229,0.14)]">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <BarChart3 size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white dark:text-white">Average Progress per Module</h2>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moduleProgressData} layout="vertical" margin={{ left: 20, right: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} formatter={(value: number) => [`${value}%`, 'Avg Progress']} />
                  <Bar dataKey="progress" fill="#6366f1" radius={[0, 12, 12, 0]} barSize={32} label={{ position: 'right', formatter: (val: number) => `${val}%`, fill: '#64748b', fontSize: 12, fontWeight: 800 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Learning Style Distribution - Pie Chart */}
          <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white dark:bg-slate-900/70 backdrop-blur-2xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.08)] transition-all duration-500 hover:shadow-[0_20px_80px_rgba(79,70,229,0.14)]">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <PieChartIcon size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white dark:text-white">Learning Style Distribution</h2>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={styleData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={8} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {styleData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Badge Distribution - Pie Chart */}
          <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white dark:bg-slate-900/70 backdrop-blur-2xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.08)] transition-all duration-500 hover:shadow-[0_20px_80px_rgba(79,70,229,0.14)]">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Medal size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white dark:text-white">Badge Distribution</h2>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={badgeData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={8} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {badgeData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Weekly Learning Heatmap */}
          <div className="bg-white dark:bg-slate-900/70 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.08)]">

            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 text-slate-900 dark:text-white">
                  Student Activity Heatmap
                </h2>

                <p className="text-slate-500 mt-2">
                  Weekly adaptive learning engagement
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
                <Activity size={22} />
              </div>
            </div>

            <div className="space-y-3">

              <div className="flex justify-between text-[10px] uppercase tracking-wider text-slate-400 px-1">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>

              <div className="grid grid-cols-7 gap-2 justify-start">
                {[...Array(35)].map((_, i) => {

                  const levels = [
                    "bg-slate-200 dark:bg-slate-800",
                    "bg-indigo-900",
                    "bg-indigo-700",
                    "bg-violet-500",
                    "bg-cyan-400"
                  ];

                  const level =
                    levels[Math.floor(Math.random() * levels.length)];

                  return (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.08 }}
                      className={`w-5 h-5 rounded-sm ${level} transition-all duration-300`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        {/* Weak Topics */}
        <div className="bg-white dark:bg-slate-900/70 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.08)]">

          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900 text-slate-900 dark:text-white">
                Weak Topic Detection
              </h2>

              <p className="text-slate-500 mt-2">
                AI identified concepts requiring reinforcement
              </p>
            </div>

            <AlertCircle className="text-orange-500" size={26} />
          </div>

          <div className="space-y-5">

            {[
              { topic: 'Neural Networks', score: 42 },
              { topic: 'HTML Semantic Tags', score: 55 },
              { topic: 'Data Structures', score: 48 },
            ].map((item, idx) => (
              <div key={idx}>

                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {item.topic}
                  </span>

                  <span className="text-sm font-bold text-orange-500">
                    {item.score}%
                  </span>
                </div>

                <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.score}%` }}
                    transition={{ duration: 1 }}
                    className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                  />
                </div>

              </div>
            ))}

          </div>
        </div>
        {/* Top Performing Students - Leaderboard */}
        <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white dark:bg-slate-900/70 backdrop-blur-2xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.08)] transition-all duration-500 hover:shadow-[0_20px_80px_rgba(79,70,229,0.14)]">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Star size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white dark:text-white">Top Performing Students</h2>
          </div>
          <div className="space-y-4">
            {topStudents.length > 0 ? (
              topStudents.map((student, idx) => (
                <motion.div
                  key={student.name}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/50 p-4 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-white">
                      {idx + 1}
                    </div>

                    <div>
                      <span className="font-bold text-slate-800 dark:text-white text-lg">
                        {student.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                      {student.score}%
                    </span>

                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Avg Score
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400 italic">
                No quiz data available yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}