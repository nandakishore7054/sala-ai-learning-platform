import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  GraduationCap,
  Sparkles,
  BrainCircuit,
  BarChart3,
  ArrowRight,
  ChevronRight,
  Play,
  Star,
  ShieldCheck,
  Zap,
  Globe,
  BookOpen,
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Adaptive AI Learning",
      desc: "Personalized learning paths based on visual, auditory, and kinesthetic learning styles.",
      icon: <BrainCircuit className="w-7 h-7 text-violet-500" />,
      large: true,
    },
    {
      title: "AI Quiz Engine",
      desc: "Dynamic quizzes generated instantly from student progress.",
      icon: <Sparkles className="w-7 h-7 text-pink-500" />,
    },
    {
      title: "Realtime Analytics",
      desc: "Track learning performance with beautiful dashboards.",
      icon: <BarChart3 className="w-7 h-7 text-cyan-500" />,
    },
    {
      title: "Teacher Insights",
      desc: "AI identifies weak concepts and recommends improvements.",
      icon: <ShieldCheck className="w-7 h-7 text-emerald-500" />,
    },
    {
      title: "Gamified Experience",
      desc: "Badges, rewards, streaks, and progress systems.",
      icon: <Zap className="w-7 h-7 text-amber-500" />,
    },
  ];

  const stats = [
    { value: "10K+", label: "Students" },
    { value: "95%", label: "Engagement" },
    { value: "500+", label: "Modules" },
    { value: "24/7", label: "AI Assistance" },
  ];

  const testimonials = [
    {
      name: "Nikhil",
      role: "Computer Science Student",
      text: "SALA completely changed how I understand technical subjects visually.",
    },
    {
      name: "Lakshmi Bhavani",
      role: "Teacher",
      text: "The analytics dashboard helped me identify struggling students instantly.",
    },
    {
      name: "Aditya",
      role: "Frontend Developer",
      text: "The adaptive learning system feels futuristic and extremely engaging.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden relative">
      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-violet-500/20 blur-[180px] rounded-full" />

        <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-cyan-400/10 blur-[160px] rounded-full" />
      </div>

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-white/70 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>

            <div>
              <h1 className="text-xl font-black tracking-tight">
                SALA
              </h1>

              <p className="text-xs text-slate-500">
                Smart Adaptive Learning
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/auth")}
              className="hidden md:block text-slate-600 hover:text-indigo-600 font-semibold transition-all"
            >
              Login
            </button>

            <button
              onClick={() => navigate("/auth")}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-xl hover:scale-105 transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-40 pb-28 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              AI Powered Education Platform
            </div>

            <h1 className="text-6xl md:text-7xl font-black leading-[1.05] tracking-tight mb-8">
              Learn Smarter
              <br />

              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent">
                With Adaptive AI
              </span>
            </h1>

            <p className="text-xl text-slate-600 leading-relaxed mb-10 max-w-2xl">
              SALA transforms learning using AI-powered adaptive modules,
              interactive visual content, smart quizzes, and deep analytics
              tailored to every learner.
            </p>

            <div className="flex flex-col sm:flex-row gap-5">
              <button
                onClick={() => navigate("/auth")}
                className="group bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3"
              >
                Start Learning
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button className="bg-white/80 backdrop-blur-xl border border-slate-200 px-8 py-5 rounded-2xl font-bold text-lg hover:border-indigo-400 transition-all flex items-center justify-center gap-3 shadow-lg">
                <Play className="w-5 h-5 text-indigo-600" />
                Watch Demo
              </button>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
              {stats.map((stat, idx) => (
                <div key={idx}>
                  <h2 className="text-3xl font-black text-slate-900">
                    {stat.value}
                  </h2>

                  <p className="text-slate-500 mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT VISUAL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/30 to-cyan-400/20 blur-3xl rounded-full" />

            <div className="relative bg-white/70 backdrop-blur-2xl border border-white/30 rounded-[2.5rem] shadow-2xl p-8">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-8 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-indigo-100 mb-2">
                        AI Learning Score
                      </p>

                      <h2 className="text-5xl font-black">
                        98%
                      </h2>
                    </div>

                    <BrainCircuit className="w-16 h-16 opacity-80" />
                  </div>
                </div>

                <div className="bg-slate-100 rounded-3xl p-6">
                  <BookOpen className="w-10 h-10 text-indigo-600 mb-4" />
                  <h3 className="font-bold text-lg">
                    Interactive Modules
                  </h3>
                </div>

                <div className="bg-slate-100 rounded-3xl p-6">
                  <Globe className="w-10 h-10 text-cyan-500 mb-4" />
                  <h3 className="font-bold text-lg">
                    Global Learning
                  </h3>
                </div>

                <div className="col-span-2 bg-slate-900 rounded-3xl p-8 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400">
                        Student Engagement
                      </p>

                      <h2 className="text-4xl font-black mt-2">
                        +95%
                      </h2>
                    </div>

                    <div className="flex gap-2">
                      <div className="w-4 h-16 rounded-full bg-violet-500" />
                      <div className="w-4 h-24 rounded-full bg-indigo-500" />
                      <div className="w-4 h-10 rounded-full bg-cyan-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black mb-6">
              Built for the Future of Learning
            </h2>

            <p className="text-xl text-slate-500 max-w-3xl mx-auto">
              Powerful AI systems combined with beautiful educational
              experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -8 }}
                className={`rounded-[2.5rem] border border-white/30 bg-white/70 backdrop-blur-2xl shadow-xl p-8 hover:shadow-indigo-100 transition-all ${
                  feature.large ? "lg:col-span-2" : ""
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>

                <h3 className="text-2xl font-bold mb-4">
                  {feature.title}
                </h3>

                <p className="text-slate-600 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-28 px-6 bg-white/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black mb-6">
              Loved by Students & Teachers
            </h2>

            <p className="text-slate-500 text-xl">
              Real feedback from learners using SALA.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((item, idx) => (
              <div
                key={idx}
                className="rounded-[2rem] bg-white border border-slate-200 p-8 shadow-lg hover:shadow-2xl transition-all"
              >
                <div className="flex gap-1 mb-5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                <p className="text-slate-600 leading-relaxed mb-8">
                  "{item.text}"
                </p>

                <div>
                  <h4 className="font-bold text-lg">
                    {item.name}
                  </h4>

                  <p className="text-slate-500 text-sm">
                    {item.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 p-16 md:p-24 text-center text-white shadow-2xl">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 blur-3xl rounded-full" />

            <div className="relative z-10">
              <h2 className="text-5xl md:text-6xl font-black mb-8 leading-tight">
                Start Your AI Learning Journey Today
              </h2>

              <p className="text-xl text-indigo-100 max-w-3xl mx-auto mb-12">
                Experience the future of adaptive education with SALA.
              </p>

              <button
                onClick={() => navigate("/auth")}
                className="bg-white text-indigo-700 px-10 py-5 rounded-2xl font-black text-xl shadow-2xl hover:scale-105 transition-all inline-flex items-center gap-3"
              >
                Launch SALA
                <ChevronRight />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>

                <span className="font-black text-xl">
                  SALA
                </span>
              </div>

              <p className="text-slate-500 leading-relaxed">
                Smart AI-powered adaptive learning platform for future education.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-5">
                Product
              </h4>

              <div className="space-y-3 text-slate-500">
                <p>Features</p>
                <p>AI Learning</p>
                <p>Analytics</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-5">
                Company
              </h4>

              <div className="space-y-3 text-slate-500">
                <p>About</p>
                <p>Careers</p>
                <p>Contact</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-5">
                Resources
              </h4>

              <div className="space-y-3 text-slate-500">
                <p>Documentation</p>
                <p>Community</p>
                <p>Support</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 mt-14 pt-8 flex flex-col md:flex-row items-center justify-between gap-5">
            <p className="text-slate-500 text-sm">
              © 2026 SALA — Smart Adaptive Learning Assistant
            </p>

            <div className="flex items-center gap-6 text-sm text-slate-500">
              <p>Privacy</p>
              <p>Terms</p>
              <p>Security</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}