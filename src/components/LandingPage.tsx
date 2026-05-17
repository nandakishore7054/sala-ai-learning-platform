import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  GraduationCap, 
  Sparkles, 
  BarChart3, 
  BrainCircuit, 
  ChevronRight, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Adaptive Learning",
      description: "AI-powered personalized modules that adapt to your unique learning style.",
      icon: <BrainCircuit className="w-8 h-8 text-indigo-500" />
    },
    {
      title: "AI Quiz Generation",
      description: "Dynamic quizzes generated on-the-fly based on the topics you've just mastered.",
      icon: <Sparkles className="w-8 h-8 text-amber-500" />
    },
    {
      title: "Teacher Analytics",
      description: "Deep insights into student progress, identifying gaps and strengths automatically.",
      icon: <BarChart3 className="w-8 h-8 text-emerald-500" />
    }
  ];

  const steps = [
    { title: "Sign up or login", desc: "Create your account in seconds." },
    { title: "Identify learning style", desc: "Take a quick assessment to find how you learn best." },
    { title: "Start personalized modules", desc: "Dive into content tailored just for you." },
    { title: "Take AI-generated quizzes", desc: "Test your knowledge with dynamic assessments." },
    { title: "Track progress", desc: "Watch your skills grow with real-time analytics." }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">SALA</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/auth')}
              className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/auth')}
              className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-50 rounded-full blur-3xl -z-10 opacity-50" />
        
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
              Smart Adaptive <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                Learning Assistant
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto font-medium">
              Personalized AI-powered learning based on your learning style.
            </p>
            <p className="text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed">
              SALA adapts learning content for visual, auditory, and kinesthetic learners 
              and provides deep analytics for teachers to track progress effectively.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => navigate('/auth')}
                className="w-full sm:w-auto bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 group"
              >
                Get Started Free
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => navigate('/auth')}
                className="w-full sm:w-auto bg-white text-slate-700 border-2 border-slate-200 px-10 py-4 rounded-2xl font-bold text-lg hover:border-indigo-600 hover:text-indigo-600 transition-all"
              >
                Login to SALA
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Powerful AI Features</h2>
            <p className="text-slate-500">Everything you need to master any subject at your own pace.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:shadow-xl hover:shadow-indigo-50 transition-all group"
              >
                <div className="mb-6 p-4 bg-white rounded-2xl w-fit shadow-sm group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How it Works</h2>
            <p className="text-slate-500">Your journey to personalized mastery in 5 simple steps.</p>
          </div>

          <div className="space-y-6">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-6 p-6 bg-white rounded-3xl border border-slate-200 shadow-sm"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shrink-0">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{step.title}</h3>
                  <p className="text-slate-500">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-indigo-600 rounded-[3rem] p-12 md:p-20 text-center text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl -ml-32 -mb-32" />
            
            <h2 className="text-4xl md:text-5xl font-black mb-8 relative z-10">
              Ready to transform your <br /> learning experience?
            </h2>
            <button 
              onClick={() => navigate('/auth')}
              className="relative z-10 bg-white text-indigo-600 px-12 py-5 rounded-2xl font-black text-xl hover:bg-slate-50 transition-all shadow-xl flex items-center justify-center gap-3 mx-auto group"
            >
              Start Learning with SALA
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-indigo-600 p-1.5 rounded-md">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">SALA</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 Smart Adaptive Learning Assistant. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
