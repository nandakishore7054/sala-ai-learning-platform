import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion, increment, addDoc, collection, serverTimestamp, onSnapshot, query, where, getDocs } from 'firebase/firestore';
import { QuizData, UserProfile, Module, Course, Progress } from '../types';
import { getHint, generateQuiz } from '../services/geminiService';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Volume2,
  ChevronRight,
  Loader2,
  BookOpen,
  Code,
  Activity,
  Sparkles,
  Youtube,
  Clock,
  CheckCircle,
  Trophy,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

import { useAccessibility } from '../context/AccessibilityContext';
import VisualLearningSection from './VisualLearningSection';

export default function ModuleViewer({ moduleId, onBack }: { moduleId: string, onBack: () => void }) {
  const { width, height } = useWindowSize();
  const location = useLocation();
  const { settings } = useAccessibility();
  const moduleData = location.state?.module as Module;
  const moduleTitle = moduleData?.module_title || 'Learning Module';

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [completedCourses, setCompletedCourses] = useState<string[]>([]);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [hint, setHint] = useState('');
  const [loadingHint, setLoadingHint] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!auth.currentUser || !moduleId) return;

    // Fetch user profile
    const unsubProfile = onSnapshot(doc(db, 'users', auth.currentUser.uid), (doc) => {
      if (doc.exists()) setProfile(doc.data() as UserProfile);
    });

    // Fetch course progress
    const q = query(
      collection(db, 'progress'),
      where('userId', '==', auth.currentUser.uid),
      where('moduleId', '==', moduleId)
    );
    const unsubProgress = onSnapshot(q, (snap) => {
      const completed = snap.docs.map(doc => doc.data().courseId);
      setCompletedCourses(completed);
    });

    return () => {
      unsubProfile();
      unsubProgress();
    };
  }, [moduleId]);

  useEffect(() => {
    if (settings.textToSpeech && selectedCourse) {
      window.speechSynthesis.cancel(); // Stop any current speech
      const utterance = new SpeechSynthesisUtterance(selectedCourse.ai_explanation);
      window.speechSynthesis.speak(utterance);
    }
  }, [selectedCourse, settings.textToSpeech]);

  const handleCompleteCourse = async (course: Course) => {
    if (!auth.currentUser || completedCourses.includes(course.course_id)) return;

    try {
      // Save progress
      await addDoc(collection(db, 'progress'), {
        userId: auth.currentUser.uid,
        moduleId: moduleId,
        courseId: course.course_id,
        completed: true,
        completedAt: serverTimestamp(),
        pointsEarned: 5
      });

      // Update user points
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        points: increment(5)
      });

      setSelectedCourse(null);
    } catch (error) {
      console.error("Error completing course:", error);
    }
  };

  const handleStartQuiz = async () => {
    setLoadingQuiz(true);
    try {
      const generatedQuiz = await generateQuiz(moduleTitle);
      setQuizData(generatedQuiz);
      setShowQuiz(true);
    } catch (error) {
      console.error("Error generating quiz:", error);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleAnswer = async () => {
    if (!quizData || !quizData.quiz[currentQuestion]) return;

    const isCorrect = selectedAnswer === quizData.quiz[currentQuestion].correct_answer;

    if (isCorrect) {
      setScore(score + 1);
      setHint('');
      if (currentQuestion < quizData.quiz.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer('');
      } else {
        finishQuiz(score + 1);
      }
    } else {
      setLoadingHint(true);
      const aiHint = await getHint(
        quizData.quiz[currentQuestion].question,
        selectedAnswer,
        quizData.quiz[currentQuestion].correct_answer,
        profile?.learningStyle || 'none'
      );
      setHint(aiHint);
      setLoadingHint(false);
    }
  };

  const finishQuiz = async (finalScore: number) => {
    if (!auth.currentUser) return;
    setQuizFinished(true);
    setShowConfetti(true);

    try {
      // Save result
      await addDoc(collection(db, 'quizResults'), {
        userId: auth.currentUser.uid,
        module: moduleTitle,
        moduleId: moduleId,
        score: finalScore,
        totalQuestions: quizData?.quiz.length || 0,
        completedAt: serverTimestamp()
      });

      // Check for badges
      const q = query(collection(db, 'quizResults'), where('userId', '==', auth.currentUser.uid));
      const snap = await getDocs(q);
      const completedCount = snap.size;

      let newBadge = '';
      if (completedCount === 2) newBadge = 'Bronze Badge';
      if (completedCount === 3) newBadge = 'Silver Badge';
      if (completedCount === 5) newBadge = 'Gold Badge';
      if (completedCount === 8) newBadge = 'Master Learner Badge';

      const updates: any = {
        points: increment(finalScore >= 4 ? 20 : 0)
      };
      if (newBadge) {
        updates.badges = arrayUnion(newBadge);
      }

      await updateDoc(doc(db, 'users', auth.currentUser.uid), updates);
    } catch (err) {
      console.error("Error finishing quiz:", err);
    }
  };

  const allCoursesCompleted = (moduleData?.courses || []).every(c => completedCourses.includes(c.course_id));

  if (!moduleData) return <div className="p-8 text-center">Module data not found.</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20 px-4">
      {showConfetti && <ReactConfetti width={width} height={height} recycle={false} numberOfPieces={500} />}

      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-8 font-medium">
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Course List */}
        {/* Left Column: Premium Learning Sidebar */}
        <div className="lg:sticky lg:top-24 h-fit">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl shadow-[0_20px_80px_rgba(79,70,229,0.15)]"
          >
            {/* Gradient Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-cyan-500/10 pointer-events-none" />

            <div className="relative p-7">
              {/* Header */}
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
                  <Sparkles size={14} className="text-indigo-500" />
                  <span className="text-xs font-semibold text-indigo-600">
                    AI Learning Path
                  </span>
                </div>

                <h1 className="text-2xl font-black leading-tight text-slate-900 dark:text-white">
                  {moduleTitle}
                </h1>

                <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                  Complete every lesson to unlock the intelligent adaptive quiz.
                </p>
              </div>

              {/* Progress Overview */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Module Progress
                  </span>

                  <span className="text-sm font-bold text-indigo-600">
                    {completedCourses.length}/{moduleData.courses.length}
                  </span>
                </div>

                <div className="h-3 rounded-full bg-slate-200/70 dark:bg-slate-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(completedCourses.length /
                          moduleData.courses.length) *
                        100
                        }%`,
                    }}
                    transition={{ duration: 0.8 }}
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500"
                  />
                </div>
              </div>

              {/* Course Navigation */}
              <div className="space-y-4">
                {(moduleData.courses || []).map((course, idx) => {
                  const isCompleted = completedCourses.includes(
                    course.course_id
                  );

                  const isSelected =
                    selectedCourse?.course_id === course.course_id;

                  return (
                    <motion.button
                      whileHover={{ y: -3, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      key={course.course_id}
                      onClick={() => {
                        setSelectedCourse(course);
                        setShowQuiz(false);
                      }}
                      className={`group relative w-full overflow-hidden rounded-2xl border transition-all duration-300 text-left ${isSelected
                          ? "border-indigo-500/40 bg-gradient-to-r from-indigo-500/15 to-violet-500/10 shadow-lg shadow-indigo-500/20"
                          : isCompleted
                            ? "border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10"
                            : "border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 hover:border-indigo-300 dark:hover:border-indigo-700"
                        }`}
                    >
                      {/* Active Glow */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-violet-500/5 pointer-events-none" />
                      )}

                      <div className="relative p-4 flex items-center gap-4">
                        {/* Icon */}
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all ${isCompleted
                              ? "bg-emerald-500 text-white"
                              : isSelected
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                            }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 size={20} />
                          ) : (
                            <span className="font-bold text-sm">
                              {idx + 1}
                            </span>
                          )}
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-bold text-sm leading-snug ${isSelected
                                ? "text-indigo-700 dark:text-indigo-300"
                                : "text-slate-800 dark:text-slate-100"
                              }`}
                          >
                            {course.course_title}
                          </h3>

                          <div className="flex items-center gap-2 mt-2">
                            <div
                              className={`h-1.5 rounded-full flex-1 overflow-hidden ${isCompleted
                                  ? "bg-emerald-100"
                                  : "bg-slate-200 dark:bg-slate-700"
                                }`}
                            >
                              <div
                                className={`h-full rounded-full ${isCompleted
                                    ? "w-full bg-emerald-500"
                                    : isSelected
                                      ? "w-3/4 bg-indigo-500"
                                      : "w-1/4 bg-slate-400"
                                  }`}
                              />
                            </div>

                            <span className="text-[10px] font-semibold text-slate-400">
                              {isCompleted ? "100%" : isSelected ? "75%" : "25%"}
                            </span>
                          </div>
                        </div>

                        <ChevronRight
                          size={18}
                          className={`transition-transform duration-300 ${isSelected
                              ? "text-indigo-500 translate-x-1"
                              : "text-slate-300 group-hover:translate-x-1"
                            }`}
                        />
                      </div>
                    </motion.button>
                  );
                })}

                {/* Premium Final Quiz Card */}
                <motion.button
                  whileHover={
                    allCoursesCompleted && !quizFinished
                      ? { y: -3, scale: 1.01 }
                      : {}
                  }
                  whileTap={{ scale: 0.98 }}
                  disabled={!allCoursesCompleted || quizFinished}
                  onClick={() => {
                    setSelectedCourse(null);
                    handleStartQuiz();
                  }}
                  className={`relative w-full overflow-hidden rounded-2xl border transition-all duration-300 text-left ${showQuiz
                      ? "border-indigo-500 bg-indigo-500/10"
                      : quizFinished
                        ? "border-emerald-500/30 bg-emerald-500/10"
                        : !allCoursesCompleted
                          ? "border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/40 opacity-70 cursor-not-allowed"
                          : "border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 hover:shadow-xl hover:shadow-indigo-500/20"
                    }`}
                >
                  <div className="p-5 flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${quizFinished
                          ? "bg-emerald-500 text-white"
                          : !allCoursesCompleted
                            ? "bg-slate-200 dark:bg-slate-800 text-slate-400"
                            : "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30"
                        }`}
                    >
                      {quizFinished ? (
                        <CheckCircle2 size={22} />
                      ) : (
                        <Sparkles size={22} />
                      )}
                    </div>

                    <div className="flex-1">
                      <h3
                        className={`font-black text-sm ${quizFinished
                            ? "text-emerald-700 dark:text-emerald-300"
                            : !allCoursesCompleted
                              ? "text-slate-400"
                              : "text-indigo-700 dark:text-indigo-300"
                          }`}
                      >
                        Final Module Quiz
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {quizFinished
                          ? "Quiz completed successfully"
                          : !allCoursesCompleted
                            ? "Complete all lessons to unlock"
                            : "AI adaptive assessment ready"}
                      </p>
                    </div>

                    {allCoursesCompleted && !quizFinished && (
                      <ChevronRight
                        size={18}
                        className="text-indigo-500"
                      />
                    )}
                  </div>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
        {/* Right Column: Content Viewer */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {showQuiz ? (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-[2.5rem] p-8 text-white shadow-2xl border border-white/10 backdrop-blur-xl"
              >
                {quizFinished ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-8">
                      <CheckCircle2 size={48} />
                    </div>
                    <h2 className="text-4xl font-bold mb-4">Awesome Job!</h2>
                    <p className="text-slate-400 mb-8 text-xl">You scored <span className="text-indigo-400 font-bold">{score}/{quizData?.quiz.length}</span></p>
                    <button
                      onClick={onBack}
                      className="bg-indigo-600 text-white px-12 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all"
                    >
                      Return to Dashboard
                    </button>
                  </div>
                ) : quizData && quizData.quiz[currentQuestion] ? (
                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-2xl font-bold">Module Quiz</h2>
                        <p className="text-slate-300 text-sm">Test your understanding of {moduleTitle}</p>
                      </div>
                      <span className="bg-indigo-500/20 text-indigo-400 px-4 py-2 rounded-xl font-bold text-sm">
                        Question {currentQuestion + 1}/{quizData.quiz.length}
                      </span>
                    </div>

                    <div className="space-y-6">
                      <p className="text-3xl font-bold leading-relaxed text-white tracking-tight">
                        {quizData.quiz[currentQuestion].question}
                      </p>
                      <div className="grid gap-4">
                        {quizData.quiz[currentQuestion].options.map((option, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedAnswer(option)}
                            className={`p-5 rounded-2xl border-2 text-left transition-all duration-300 text-lg font-semibold ${selectedAnswer === option
                                ? 'border-indigo-400 bg-indigo-500/20 text-white shadow-lg shadow-indigo-500/20 scale-[1.02]'
                                : 'border-slate-700 bg-slate-800/80 text-slate-100 hover:border-indigo-500 hover:bg-slate-800'
                              }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    {hint && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-2xl flex gap-4"
                      >
                        <Lightbulb className="text-amber-500 shrink-0" size={24} />
                        <div>
                          <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">AI Hint</p>
                          <p className="text-white/90 leading-relaxed font-medium">{hint}</p>
                        </div>
                      </motion.div>
                    )}

                    <button
                      onClick={handleAnswer}
                      disabled={!selectedAnswer || loadingHint}
                      className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white py-5 rounded-2xl font-bold hover:scale-[1.01] hover:shadow-2xl hover:shadow-indigo-500/30 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 text-xl"
                    >
                      {loadingHint ? <Loader2 className="animate-spin" /> : <>Next Question <ChevronRight size={24} /></>}
                    </button>
                  </div>
                ) : null}
              </motion.div>
            ) : selectedCourse ? (
              <motion.div
                key={selectedCourse.course_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100"
              >
                <div className="bg-indigo-600 p-10 text-white relative">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">{selectedCourse.course_title}</h2>
                      <div className="flex gap-4 text-indigo-100 text-sm font-medium">
                        <span className="flex items-center gap-1"><Clock size={14} /> {selectedCourse.estimated_time}</span>
                        <span className="flex items-center gap-1"><Trophy size={14} /> 5 Points</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const utterance = new SpeechSynthesisUtterance(selectedCourse.ai_explanation);
                        window.speechSynthesis.speak(utterance);
                      }}
                      className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                    >
                      <Volume2 size={24} />
                    </button>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown>{selectedCourse.ai_explanation}</ReactMarkdown>
                  </div>
                </div>

                <div className="p-10 space-y-12">
                  {/* Enhanced Visual Learning Section */}
                  <section>
                    <VisualLearningSection
                      course={selectedCourse}
                      domain={moduleData.module_title} // Using module title as domain context
                      learningStyle={profile?.learningStyle || 'visual'}
                    />

                    <div className="mt-6 bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm">
                      <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                        <Youtube size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Recommended Video</p>
                        <p className="text-xs text-slate-500">{selectedCourse.youtube_video_suggestion}</p>
                      </div>
                    </div>
                  </section>

                  {/* Activity */}
                  <section>
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Activity className="text-indigo-600" size={20} />
                      Learning Activity
                    </h3>
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-slate-700">
                      <ReactMarkdown>{selectedCourse.activity}</ReactMarkdown>
                    </div>
                  </section>

                  {!completedCourses.includes(selectedCourse.course_id) ? (
                    <button
                      onClick={() => handleCompleteCourse(selectedCourse)}
                      className="w-full bg-green-600 text-white py-5 rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2 text-xl"
                    >
                      <CheckCircle size={24} /> Mark Course as Complete
                    </button>
                  ) : (
                    <div className="w-full py-5 rounded-2xl font-bold bg-green-50 text-green-600 border-2 border-green-200 flex items-center justify-center gap-2 text-xl">
                      <CheckCircle2 size={24} /> Course Completed!
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="bg-white rounded-[2.5rem] p-12 text-center border-2 border-dashed border-slate-200 flex flex-col items-center justify-center h-full min-h-[400px]">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6">
                  <BookOpen size={40} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Ready to learn?</h2>
                <p className="text-slate-500 max-w-xs mx-auto">Select a course from the list on the left to begin your journey into {moduleTitle}.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
