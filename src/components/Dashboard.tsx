import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, onSnapshot, updateDoc, collection, query, where, getDocs, setDoc } from 'firebase/firestore';
import { UserProfile, UserStats, Module, DomainData } from '../types';
import { generateDomainData, getRecommendations } from '../services/geminiService';
import { 
  Trophy, 
  Target, 
  Zap, 
  Sparkles, 
  BookOpen, 
  ChevronRight,
  Eye,
  Ear,
  Hand,
  Loader2,
  Search,
  Layout
} from 'lucide-react';
import { motion } from 'motion/react';

const DOMAINS = [
  "Web Development",
  "Data Structures",
  "Artificial Intelligence",
  "Machine Learning",
  "Cybersecurity",
  "Cloud Computing"
];

const STARTER_AI_MODULES: Module[] = [
  {
    module_id: "ai-101-basics",
    module_title: "Introduction to Artificial Intelligence",
    courses: [
      {
        course_id: "ai-foundations",
        course_title: "Foundations of AI",
        ai_explanation: "Artificial Intelligence (AI) is the science of making machines smart. It involves creating algorithms that allow computers to learn, reason, and solve problems like humans.",
        diagram_description: "A Venn diagram showing AI as the largest circle, containing Machine Learning, which in turn contains Deep Learning.",
        youtube_video_suggestion: "What is Artificial Intelligence in 5 minutes",
        activity: "Research and list 3 examples of AI you interact with daily (e.g., Siri, Netflix recommendations).",
        estimated_time: "10 mins"
      }
    ]
  },
  {
    module_id: "ai-mach-learn",
    module_title: "Machine Learning Essentials",
    courses: [
      {
        course_id: "ml-concept",
        course_title: "The Concept of Learning",
        ai_explanation: "Machine Learning (ML) is a subset of AI that focuses on building systems that learn from data. Instead of being explicitly programmed, the system improves its performance as it is exposed to more information.",
        diagram_description: "A flowchart showing Data -> Algorithm -> Model -> Prediction.",
        youtube_video_suggestion: "How Machine Learning Works",
        activity: "Explain the difference between Supervised and Unsupervised learning in one sentence.",
        estimated_time: "15 mins"
      }
    ]
  },
  {
    module_id: "ai-nlp",
    module_title: "Natural Language Processing",
    courses: [
      {
        course_id: "nlp-intro",
        course_title: "Teaching Machines to Read",
        ai_explanation: "NLP allows computers to understand, interpret, and generate human language. This technology powers chatbots, translation tools, and sentiment analysis.",
        diagram_description: "An illustration of a computer processing 'Hello' into binary and then into a 'Greeting' intent.",
        youtube_video_suggestion: "What is NLP?",
        activity: "Use an online translator and see if you can find a phrase that it struggles to translate perfectly.",
        estimated_time: "20 mins"
      }
    ]
  },
  {
    module_id: "ai-ethics",
    module_title: "AI Ethics & Responsibility",
    courses: [
      {
        course_id: "ethics-101",
        course_title: "Bias and Fairness",
        ai_explanation: "As AI becomes more powerful, we must ensure it is used ethically. This involves addressing bias in data, ensuring transparency, and protecting user privacy.",
        diagram_description: "A balance scale with 'Efficiency' on one side and 'Ethics' on the other.",
        youtube_video_suggestion: "The Ethics of AI",
        activity: "Read about a famous case where AI bias caused an issue and summarize it.",
        estimated_time: "15 mins"
      }
    ]
  }
];

export default function Dashboard({ onSelectModule }: { onSelectModule: (module: Module) => void }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string>('');
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingModules, setGeneratingModules] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubUser = onSnapshot(doc(db, 'users', auth.currentUser.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data() as UserProfile;
        setProfile(data);
      }
    });

    // Fetch completed modules from quizResults
    const q = query(collection(db, 'quizResults'), where('userId', '==', auth.currentUser.uid));
    const unsubQuiz = onSnapshot(q, (snap) => {
      const completed = snap.docs.map(doc => doc.data().moduleId);
      setCompletedModules(completed);
    });

    return () => {
      unsubUser();
      unsubQuiz();
    };
  }, []);

  useEffect(() => {
    if (profile) {
      const fetchInitialData = async () => {
        // Fetch recommendations
        const recs = await getRecommendations(profile.learningStyle, completedModules);
        setRecommendations(recs);

        // If domain is already selected and modules are empty, fetch or generate them
        if (profile.domain && modules.length === 0) {
          await handleDomainSelect(profile.domain);
        }
        
        setLoading(false);
      };
      fetchInitialData();
    }
  }, [profile?.uid, profile?.domain, completedModules.length]);

  const handleDomainSelect = async (domain: string) => {
    if (!profile) return;
    
    setGeneratingModules(true);
    setModules([]); // Clear existing modules while loading
    
    try {
      // Update profile domain in Firestore if changed
      if (profile.domain !== domain) {
        await updateDoc(doc(db, 'users', profile.uid), { domain });
      }

      // Check if modules for this domain already exist in learning_paths
      const cacheKey = `${domain.toLowerCase().replace(/\s+/g, '-')}-${profile.learningStyle}`;
      const cacheRef = doc(db, 'learning_paths', cacheKey);
      const cacheSnap = await getDoc(cacheRef);
      
      const cachedModules = cacheSnap.exists() ? cacheSnap.data().modules : [];

      if (Array.isArray(cachedModules) && cachedModules.length > 0) {
        setModules(cachedModules);
      } else {
        // Generate new modules
        let generatedModules: Module[] = [];
        
        // Use starter modules for AI to ensure high quality initial content
        if (domain === "Artificial Intelligence") {
          generatedModules = [...STARTER_AI_MODULES];
        }

        try {
          const generated = await generateDomainData(domain, profile.learningStyle);
          // Filter out any duplicates if we have starter modules
          const newModules = (generated.modules || []).filter(m => 
            !generatedModules.some(sm => sm.module_id === m.module_id || sm.module_title === m.module_title)
          );
          generatedModules = [...generatedModules, ...newModules];
        } catch (error) {
          console.error("AI Generation failed, using starter modules if available", error);
        }

        // Final fallback for AI
        if (generatedModules.length === 0 && domain === "Artificial Intelligence") {
          generatedModules = STARTER_AI_MODULES;
        }

        setModules(generatedModules);
        
        // Save to learning_paths for cache
        if (generatedModules.length > 0) {
          await setDoc(cacheRef, {
            domain,
            learningStyle: profile.learningStyle,
            modules: generatedModules
          });
        }
      }
    } catch (error) {
      console.error("Error handling domain select:", error);
    } finally {
      setGeneratingModules(false);
    }
  };

  if (!profile) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
    </div>
  );

  const styleIcon = {
    visual: <Eye className="text-blue-500" />,
    auditory: <Ear className="text-purple-500" />,
    kinesthetic: <Hand className="text-orange-500" />,
    none: <Sparkles className="text-slate-400" />
  }[profile.learningStyle];

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            {styleIcon}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Welcome back, {profile.name}!</h1>
            <p className="text-slate-500 flex items-center gap-2">
              Your learning style is <span className="font-bold text-indigo-600 capitalize">{profile.learningStyle}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="bg-amber-50 px-6 py-3 rounded-2xl border border-amber-100 flex items-center gap-3">
            <Trophy className="text-amber-500" />
            <div>
              <p className="text-xs text-amber-600 font-bold uppercase tracking-wider">Points</p>
              <p className="text-2xl font-bold text-amber-700">{profile.points}</p>
            </div>
          </div>
          <div className="bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100 flex items-center gap-3">
            <Zap className="text-indigo-500" />
            <div>
              <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Badges</p>
              <p className="text-2xl font-bold text-indigo-700">{(profile.badges || []).length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Domain Selection & Modules */}
        <div className="lg:col-span-2 space-y-8">
          {/* Domain Selection */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Search className="text-indigo-600" />
              Select Your Learning Domain
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {DOMAINS.map(domain => (
                <button
                  key={domain}
                  onClick={() => handleDomainSelect(domain)}
                  disabled={generatingModules}
                  className={`px-4 py-3 rounded-xl text-sm font-bold transition-all border-2 ${
                    profile.domain === domain 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'bg-slate-50 text-slate-600 border-transparent hover:border-indigo-200'
                  }`}
                >
                  {domain}
                </button>
              ))}
            </div>
          </div>

          {/* Modules List */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Layout className="text-indigo-600" />
                {profile.domain ? `${profile.domain} Modules` : 'Select a domain to see modules'}
              </h2>
              {profile.domain && (
                <span className="text-sm font-bold text-indigo-600">
                  {completedModules.length} Completed
                </span>
              )}
            </div>

            {generatingModules ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
                <p className="text-slate-500 animate-pulse">Generating your personalized learning path...</p>
              </div>
            ) : modules.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modules.map((module) => {
                  const isCompleted = completedModules.includes(module.module_id);
                  return (
                    <motion.div
                      key={module.module_id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onSelectModule(module)}
                      className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between h-full ${
                        isCompleted 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-slate-50 border-transparent hover:border-indigo-600'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-bold text-slate-900 leading-tight">{module.module_title}</h3>
                          {isCompleted && <Zap className="text-green-500 shrink-0" size={20} />}
                        </div>
                        <div className="flex gap-2 mt-4">
                          <span className="px-2 py-1 bg-slate-200 text-slate-700 text-[10px] font-bold rounded-md uppercase">
                            {(module.courses || []).length} Courses
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 italic">
                {profile.domain ? 'No modules found for this domain.' : 'Choose a domain above to start your journey!'}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Recommendations & Badges */}
        <div className="space-y-8">
          {/* AI Recommendations */}
          <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-lg shadow-indigo-200">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="text-indigo-200" />
              AI Recommendations
            </h2>
            {loading ? (
              <div className="flex items-center gap-2 text-indigo-200">
                <Loader2 className="animate-spin" size={16} />
                Generating...
              </div>
            ) : (
              <div className="text-indigo-100 text-sm leading-relaxed whitespace-pre-wrap">
                {recommendations}
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Your Badges</h2>
            <div className="grid grid-cols-3 gap-4">
              {(profile.badges || []).length > 0 ? (
                profile.badges.map((badge, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center border-2 border-amber-200">
                      <Zap className="text-amber-500" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase text-center">{badge}</span>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-8 text-slate-400 italic">
                  Complete modules to earn badges!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
