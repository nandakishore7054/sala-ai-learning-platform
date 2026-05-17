import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { LearningStyle } from '../types';
import { Brain, Eye, Ear, Hand, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

const questions = [
  {
    id: 1,
    text: "When you learn something new, how do you prefer to start?",
    options: [
      { text: "Watching a video or looking at diagrams", style: "visual" },
      { text: "Listening to an explanation or podcast", style: "auditory" },
      { text: "Trying it out immediately with my hands", style: "kinesthetic" }
    ]
  },
  {
    id: 2,
    text: "How do you usually remember directions?",
    options: [
      { text: "Visualizing a map in my head", style: "visual" },
      { text: "Repeating the verbal instructions to myself", style: "auditory" },
      { text: "Remembering the physical turns and landmarks", style: "kinesthetic" }
    ]
  },
  {
    id: 3,
    text: "What kind of classroom activity do you enjoy most?",
    options: [
      { text: "PowerPoint presentations with lots of images", style: "visual" },
      { text: "Group discussions and lectures", style: "auditory" },
      { text: "Lab experiments and hands-on projects", style: "kinesthetic" }
    ]
  },
  {
    id: 4,
    text: "When you are solving a problem, you tend to...",
    options: [
      { text: "Draw it out or use a whiteboard", style: "visual" },
      { text: "Talk it through with someone else", style: "auditory" },
      { text: "Build a model or use physical objects", style: "kinesthetic" }
    ]
  },
  {
    id: 5,
    text: "Which of these sounds most like you?",
    options: [
      { text: "I am a visual person, I need to see it", style: "visual" },
      { text: "I am a good listener, I remember what I hear", style: "auditory" },
      { text: "I learn by doing, I can't sit still for long", style: "kinesthetic" }
    ]
  }
];

export default function Quiz({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<LearningStyle[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAnswer = (style: LearningStyle) => {
    const newAnswers = [...answers, style];
    if (currentStep < questions.length - 1) {
      setAnswers(newAnswers);
      setCurrentStep(currentStep + 1);
    } else {
      calculateResult(newAnswers);
    }
  };

  const calculateResult = async (finalAnswers: LearningStyle[]) => {
    setLoading(true);
    const counts = finalAnswers.reduce((acc, style) => {
      acc[style] = (acc[style] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const result = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as LearningStyle;

    try {
      if (auth.currentUser) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          learningStyle: result
        });
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
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-indigo-600 p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Brain size={32} />
            <h2 className="text-2xl font-bold">Learning Style Quiz</h2>
          </div>
          <div className="w-full bg-indigo-400 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-500" 
              style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
          <p className="mt-2 text-indigo-100 text-sm">Question {currentStep + 1} of {questions.length}</p>
        </div>

        <div className="p-8">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-semibold text-slate-800">{question.text}</h3>
            <div className="grid gap-4">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option.style as LearningStyle)}
                  disabled={loading}
                  className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-indigo-600">
                      {option.style === 'visual' && <Eye size={20} />}
                      {option.style === 'auditory' && <Ear size={20} />}
                      {option.style === 'kinesthetic' && <Hand size={20} />}
                    </div>
                    <span className="text-slate-700 font-medium">{option.text}</span>
                  </div>
                  <ChevronRight className="text-slate-300 group-hover:text-indigo-600" />
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
