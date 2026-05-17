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
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{moduleTitle}</h1>
            <p className="text-slate-500 text-sm mb-6">Complete all courses to unlock the final quiz.</p>
            
            <div className="space-y-3">
              {(moduleData.courses || []).map((course, idx) => {
                const isCompleted = completedCourses.includes(course.course_id);
                const isSelected = selectedCourse?.course_id === course.course_id;
                
                return (
                  <button
                    key={course.course_id}
                    onClick={() => {
                      setSelectedCourse(course);
                      setShowQuiz(false);
                    }}
                    className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center justify-between ${
                      isSelected 
                        ? 'border-indigo-600 bg-indigo-50' 
                        : isCompleted 
                          ? 'border-green-100 bg-green-50' 
                          : 'border-slate-50 bg-slate-50 hover:border-indigo-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCompleted ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {isCompleted ? <CheckCircle size={16} /> : idx + 1}
                      </div>
                      <span className={`font-bold text-sm ${isCompleted ? 'text-green-700' : 'text-slate-700'}`}>
                        {course.course_title}
                      </span>
                    </div>
                    <ChevronRight size={16} className={isSelected ? 'text-indigo-600' : 'text-slate-300'} />
                  </button>
                );
              })}

              {/* Final Quiz Item */}
              <button
                disabled={!allCoursesCompleted || quizFinished}
                onClick={() => {
                  setSelectedCourse(null);
                  handleStartQuiz();
                }}
                className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center justify-between ${
                  showQuiz 
                    ? 'border-indigo-600 bg-indigo-50' 
                    : quizFinished
                      ? 'border-green-100 bg-green-50 opacity-80'
                      : !allCoursesCompleted
                        ? 'border-slate-100 bg-slate-50/50 opacity-50 cursor-not-allowed'
                        : 'border-indigo-100 bg-indigo-50/30 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    quizFinished ? 'bg-green-500 text-white' : !allCoursesCompleted ? 'bg-slate-200 text-slate-400' : 'bg-indigo-600 text-white'
                  }`}>
                    {quizFinished ? <CheckCircle size={16} /> : <Sparkles size={16} />}
                  </div>
                  <div className="flex flex-col">
                    <span className={`font-bold text-sm ${quizFinished ? 'text-green-700' : !allCoursesCompleted ? 'text-slate-400' : 'text-indigo-700'}`}>
                      Final Module Quiz
                    </span>
                    {!allCoursesCompleted && (
                      <span className="text-[10px] text-slate-400 font-medium">Locked until courses complete</span>
                    )}
                  </div>
                </div>
                {allCoursesCompleted && !quizFinished && <ChevronRight size={16} className="text-indigo-600" />}
              </button>
            </div>

            {quizFinished && (
              <div className="mt-8 p-6 bg-indigo-600 rounded-3xl text-white shadow-lg shadow-indigo-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-white/20 rounded-2xl">
                    <Trophy size={24} className="text-amber-300" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-indigo-200">Module Mastered</p>
                    <p className="text-xl font-bold">Great Work!</p>
                  </div>
                </div>
                <p className="text-indigo-100 text-sm leading-relaxed">
                  You've successfully completed all courses and the final quiz for this module.
                </p>
              </div>
            )}
          </div>
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
                className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl"
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
                        <p className="text-slate-400 text-sm">Test your understanding of {moduleTitle}</p>
                      </div>
                      <span className="bg-indigo-500/20 text-indigo-400 px-4 py-2 rounded-xl font-bold text-sm">
                        Question {currentQuestion + 1}/{quizData.quiz.length}
                      </span>
                    </div>

                    <div className="space-y-6">
                      <p className="text-2xl font-medium leading-relaxed">{quizData.quiz[currentQuestion].question}</p>
                      <div className="grid gap-4">
                        {quizData.quiz[currentQuestion].options.map((option, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedAnswer(option)}
                            className={`p-5 rounded-2xl border-2 text-left transition-all text-lg ${
                              selectedAnswer === option 
                                ? 'border-indigo-500 bg-indigo-500/20 text-white' 
                                : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700'
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
                          <p className="text-amber-200 leading-relaxed">{hint}</p>
                        </div>
                      </motion.div>
                    )}

                    <button
                      onClick={handleAnswer}
                      disabled={!selectedAnswer || loadingHint}
                      className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-xl"
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
