import React, { useState } from "react";
import { db, auth } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { LearningStyle } from "../types";

import {
  Brain,
  Eye,
  Ear,
  Hand,
  ChevronRight,
  Sparkles,
  Trophy,
  Zap,
  CheckCircle2,
} from "lucide-react";

import { motion, AnimatePresence } from "motion/react";

const questions = [
  {
    id: 1,
    text: "When you learn something new, how do you prefer to start?",
    options: [
      { text: "Watching a video or looking at diagrams", style: "visual" },
      { text: "Listening to an explanation or podcast", style: "auditory" },
      { text: "Trying it out immediately with my hands", style: "kinesthetic" },
    ],
  },

  {
    id: 2,
    text: "How do you usually remember directions?",
    options: [
      { text: "Visualizing a map in my head", style: "visual" },
      {
        text: "Repeating the verbal instructions to myself",
        style: "auditory",
      },
      {
        text: "Remembering the physical turns and landmarks",
        style: "kinesthetic",
      },
    ],
  },

  {
    id: 3,
    text: "What kind of classroom activity do you enjoy most?",
    options: [
      {
        text: "PowerPoint presentations with lots of images",
        style: "visual",
      },
      { text: "Group discussions and lectures", style: "auditory" },
      {
        text: "Lab experiments and hands-on projects",
        style: "kinesthetic",
      },
    ],
  },

  {
    id: 4,
    text: "When you are solving a problem, you tend to...",
    options: [
      { text: "Draw it out or use a whiteboard", style: "visual" },
      { text: "Talk it through with someone else", style: "auditory" },
      {
        text: "Build a model or use physical objects",
        style: "kinesthetic",
      },
    ],
  },

  {
    id: 5,
    text: "Which of these sounds most like you?",
    options: [
      {
        text: "I am a visual person, I need to see it",
        style: "visual",
      },
      {
        text: "I am a good listener, I remember what I hear",
        style: "auditory",
      },
      {
        text: "I learn by doing, I can't sit still for long",
        style: "kinesthetic",
      },
    ],
  },
];

export default function Quiz({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<LearningStyle[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  const handleAnswer = (style: LearningStyle, index: number) => {
    setSelected(index);

    setTimeout(() => {
      const newAnswers = [...answers, style];

      if (currentStep < questions.length - 1) {
        setAnswers(newAnswers);
        setCurrentStep(currentStep + 1);
        setSelected(null);
      } else {
        calculateResult(newAnswers);
      }
    }, 500);
  };

  const calculateResult = async (
    finalAnswers: LearningStyle[]
  ) => {
    setLoading(true);

    const counts = finalAnswers.reduce((acc, style) => {
      acc[style] = (acc[style] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const result = Object.entries(counts).sort(
      (a, b) => b[1] - a[1]
    )[0][0] as LearningStyle;

    try {
      if (auth.currentUser) {
        await updateDoc(
          doc(db, "users", auth.currentUser.uid),
          {
            learningStyle: result,
          }
        );

        onComplete();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const question = questions[currentStep];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-slate-50 via-indigo-50 to-violet-100 dark:from-[#071028] dark:via-[#0f172a] dark:to-[#111827] overflow-hidden relative">

      {/* Background Glow */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-violet-500/20 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-3xl"
      >
        <div className="rounded-[2rem] overflow-hidden border border-white/20 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl shadow-[0_20px_80px_rgba(79,70,229,0.25)]">

          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 p-8 text-white">

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_40%)]" />

            <div className="relative flex items-start justify-between flex-wrap gap-6">

              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-3xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <Brain size={34} />
                  </div>

                  <div>
                    <h1 className="text-3xl font-black">
                      Learning Style Quiz
                    </h1>

                    <p className="text-indigo-100 mt-1">
                      AI-powered adaptive learning assessment
                    </p>
                  </div>
                </div>

                {/* XP */}
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 rounded-2xl bg-white/10 border border-white/20 flex items-center gap-2">
                    <Zap size={16} className="text-yellow-300" />
                    <span className="font-semibold text-sm">
                      +50 XP per answer
                    </span>
                  </div>

                  <div className="px-4 py-2 rounded-2xl bg-white/10 border border-white/20 flex items-center gap-2">
                    <Trophy size={16} className="text-amber-300" />
                    <span className="font-semibold text-sm">
                      AI Skill Detection
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Ring */}
              <div className="flex flex-col items-center">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 rotate-[-90deg]">
                    <circle
                      cx="48"
                      cy="48"
                      r="38"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="8"
                      fill="none"
                    />

                    <motion.circle
                      cx="48"
                      cy="48"
                      r="38"
                      stroke="white"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{
                        pathLength:
                          (currentStep + 1) / questions.length,
                      }}
                      style={{
                        pathLength:
                          (currentStep + 1) / questions.length,
                      }}
                    />
                  </svg>

                  <div className="absolute inset-0 flex items-center justify-center text-xl font-black">
                    {Math.round(
                      ((currentStep + 1) /
                        questions.length) *
                        100
                    )}
                    %
                  </div>
                </div>

                <p className="mt-3 text-sm text-indigo-100">
                  Question {currentStep + 1}/{questions.length}
                </p>
              </div>
            </div>
          </div>

          {/* Question Area */}
          <div className="p-8 md:p-10">

            {/* AI Hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8 rounded-3xl border border-indigo-200/40 dark:border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 p-5"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shrink-0">
                  <Sparkles size={22} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    AI Insight
                  </h3>

                  <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 leading-relaxed">
                    Your answers help SALA personalize lessons,
                    visuals, quizzes, and study experiences
                    specifically for your learning behavior.
                  </p>
                </div>
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35 }}
              >
                <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-snug mb-8">
                  {question.text}
                </h2>

                <div className="grid gap-5">
                  {question.options.map((option, idx) => {
                    const isSelected = selected === idx;

                    return (
                      <motion.button
                        whileHover={{
                          y: -3,
                          scale: 1.01,
                        }}
                        whileTap={{ scale: 0.98 }}
                        key={idx}
                        onClick={() =>
                          handleAnswer(
                            option.style as LearningStyle,
                            idx
                          )
                        }
                        disabled={loading}
                        className={`group relative overflow-hidden rounded-3xl border transition-all duration-300 p-6 text-left ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-500/10 shadow-xl shadow-indigo-500/20"
                            : "border-slate-200/70 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 hover:border-indigo-300 dark:hover:border-indigo-500"
                        }`}
                      >
                        {/* Glow */}
                        {isSelected && (
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-violet-500/10" />
                        )}

                        <div className="relative flex items-center justify-between gap-5">

                          <div className="flex items-center gap-5">

                            {/* Icon */}
                            <div
                              className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all ${
                                option.style === "visual"
                                  ? "bg-pink-500/10 text-pink-500"
                                  : option.style === "auditory"
                                  ? "bg-cyan-500/10 text-cyan-500"
                                  : "bg-emerald-500/10 text-emerald-500"
                              }`}
                            >
                              {option.style === "visual" && (
                                <Eye size={28} />
                              )}

                              {option.style === "auditory" && (
                                <Ear size={28} />
                              )}

                              {option.style === "kinesthetic" && (
                                <Hand size={28} />
                              )}
                            </div>

                            {/* Text */}
                            <div>
                              <p className="text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                                {option.text}
                              </p>

                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 capitalize">
                                {option.style} learner
                              </p>
                            </div>
                          </div>

                          {isSelected ? (
                            <CheckCircle2
                              size={26}
                              className="text-indigo-500"
                            />
                          ) : (
                            <ChevronRight className="text-slate-300 group-hover:text-indigo-500 transition-all" />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}