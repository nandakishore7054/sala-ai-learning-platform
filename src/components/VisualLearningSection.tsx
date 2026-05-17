import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Eye,
  Lightbulb,
  Map,
  Zap,
  BrainCircuit,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  Play,
  Pause,
  Square,
  Volume2,
} from "lucide-react";

import { Course, LearningStyle } from "../types";
import { getVisualEnhancements } from "../services/geminiService";
import { courseImages } from "../data/courseImages";
import { visualContent } from "../data/visualContent";
import ReactMarkdown from "react-markdown";
import { recommendedVideos } from "../data/recommendedVideos";
interface VisualLearningSectionProps {
  course: Course;
  domain: string;
  learningStyle: LearningStyle;
}

export default function VisualLearningSection({
  course,
  domain,
  learningStyle,
}: VisualLearningSectionProps) {
  const [loading, setLoading] = useState(true);

  const [metadata, setMetadata] = useState<any>(
    course.visual_learning_metadata || {}
  );

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  useEffect(() => {
    async function loadEnhancements() {
      try {
        if (!metadata || Object.keys(metadata).length === 0) {
          setLoading(true);

          const enhanced = await getVisualEnhancements(
            course.course_title,
            domain,
            learningStyle
          );

          if (enhanced) {
            setMetadata(enhanced);
          }
        }
      } catch (error) {
        console.error("Visual Enhancement Load Error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadEnhancements();
  }, [course.course_id]);

  // CURATED LOCAL IMAGES

  const currentImages = courseImages[course.course_title];
  const currentContent = visualContent[course.course_title];
  const currentVideo = recommendedVideos[course.course_title];
  const lessonNarration = `
${course.course_title}.

${course.ai_explanation || ""}

Visual explanation:
${currentContent?.breakdown || ""}

Helpful tip:
${currentContent?.tip || ""}

Real world example:
${currentContent?.real || ""}
`;

const startSpeech = () => {
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(
    lessonNarration
  );

  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;

  utterance.onstart = () => {
    setIsSpeaking(true);
    setIsPaused(false);
  };

  utterance.onend = () => {
    setIsSpeaking(false);
    setIsPaused(false);
  };

  speechSynthesis.speak(utterance);
};

const pauseSpeech = () => {
  speechSynthesis.pause();
  setIsPaused(true);
};

const resumeSpeech = () => {
  speechSynthesis.resume();
  setIsPaused(false);
};

const stopSpeech = () => {
  speechSynthesis.cancel();
  setIsSpeaking(false);
  setIsPaused(false);
};
  const imageUrl =
    currentImages?.visual ||
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085";

  const fallbackUrl =
    "https://images.unsplash.com/photo-1454165833767-027ffea9e77b?auto=format&fit=crop&q=80&w=800";

  // SAFE STRING FUNCTION

  const safeText = (value: any, fallback: string) => {
    if (!value) return fallback;

    if (typeof value === "string") return value;

    if (typeof value === "object") {
      return (
        value.description ||
        value.tip ||
        value.text ||
        JSON.stringify(value)
      );
    }

    return fallback;
  };

  return (
    <div className="space-y-8">
      {/* MAIN VISUAL CARD */}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100 group"
      >
        <div className="relative aspect-video bg-slate-100">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
          )}

          <img
            src={imageError ? fallbackUrl : imageUrl}
            alt={course.course_title}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
            <p className="text-white text-sm font-medium flex items-center gap-2">
              <ImageIcon size={16} />
              Interactive Educational Visual
            </p>
          </div>
        </div>

        {/* VISUAL BREAKDOWN */}

        <div className="p-8 bg-indigo-50/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <Eye size={20} />
            </div>

            <h3 className="text-xl font-bold text-slate-900">
              Visual Pattern & Breakdown
            </h3>
            <div className="flex items-center gap-3 mt-4 flex-wrap">

  {!isSpeaking && (
    <button
      onClick={startSpeech}
      className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-semibold hover:scale-105 transition"
    >
      <Play size={18} />
      Listen to Lesson
    </button>
  )}

  {isSpeaking && !isPaused && (
    <button
      onClick={pauseSpeech}
      className="flex items-center gap-2 bg-yellow-400 text-slate-900 px-4 py-2 rounded-xl font-semibold"
    >
      <Pause size={18} />
      Pause
    </button>
  )}

  {isSpeaking && isPaused && (
    <button
      onClick={resumeSpeech}
      className="flex items-center gap-2 bg-green-400 text-slate-900 px-4 py-2 rounded-xl font-semibold"
    >
      <Play size={18} />
      Resume
    </button>
  )}

  {isSpeaking && (
    <button
      onClick={stopSpeech}
      className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl font-semibold"
    >
      <Square size={18} />
      Stop
    </button>
  )}

  {isSpeaking && (
    <div className="flex items-center gap-2 text-indigo-600 animate-pulse">
      <Volume2 size={20} />
      <span className="font-medium">
        AI Narrator Speaking...
      </span>
    </div>
  )}

</div>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 animate-pulse rounded w-full" />
                <div className="h-4 bg-slate-200 animate-pulse rounded w-3/4" />
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="prose prose-indigo max-w-none"
              >
                <p className="text-slate-700 leading-relaxed">
                  {currentContent?.breakdown || course.diagram_description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* BENTO GRID */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* VISUAL TIP */}

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-3xl border border-amber-100 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-500 rounded-xl text-white">
              <Zap size={20} />
            </div>

            <h4 className="font-bold text-slate-900">Visual Tip</h4>
          </div>

          {currentImages?.tip && (
            <img
              src={currentImages.tip}
              alt="Visual Tip"
              className="w-full h-40 object-cover rounded-2xl mb-4"
            />
          )}

          {loading ? (
            <div className="h-12 bg-slate-50 animate-pulse rounded" />
          ) : (
            <p className="text-slate-600 text-sm leading-relaxed italic">
              "
              {
  currentContent?.tip ||
  safeText(
    metadata?.visual_tip,
    "Look for patterns in the structure to better understand the concept."
  )
}
              "
            </p>
          )}
        </motion.div>

        {/* MENTAL MAP */}
<motion.div
  whileHover={{ y: -5 }}
  className="bg-white rounded-[2rem] p-6 border border-indigo-100 shadow-lg"
>
  <div className="flex items-center gap-3 mb-4">
    <div className="p-2 bg-indigo-600 rounded-xl text-white">
      <BrainCircuit size={20} />
    </div>

    <h3 className="text-xl font-bold">
      Mental Map
    </h3>
  </div>

  <div className="flex flex-wrap gap-2">
  {currentContent?.mentalMap ? (
    currentContent.mentalMap.map((item, idx) => (
      <span
        key={idx}
        className="px-3 py-1 rounded-full bg-white border border-indigo-200 text-xs text-slate-700"
      >
        {item}
      </span>
    ))
  ) : metadata?.concept_map_summary &&
    typeof metadata.concept_map_summary === "object" ? (
    Object.entries(metadata.concept_map_summary).map(
      ([key, value]: any) => (
        <span
          key={key}
          className="px-3 py-1 rounded-full bg-white border border-indigo-200 text-xs text-slate-700"
        >
          {key}
        </span>
      )
    )
  ) : (
    <span className="text-slate-500 text-sm">
      Connect concepts visually.
    </span>
  )}
</div>
</motion.div>
        {/* REAL WORLD EXAMPLE */}

        <motion.div
          whileHover={{ y: -5 }}
          className="md:col-span-2 bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <ExternalLink size={120} />
          </div>

          <div className="relative z-10">
            {currentImages?.real && (
              <img
                src={currentImages.real}
                alt="Real World Example"
                className="w-full h-64 object-cover rounded-2xl mb-6"
              />
            )}

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-600 rounded-xl text-white">
                <Lightbulb size={24} />
              </div>

              <h4 className="text-xl font-bold">
                See Real-World Example
              </h4>
            </div>

            {loading ? (
              <div className="space-y-3">
                <div className="h-4 bg-white/10 animate-pulse rounded w-full" />
                <div className="h-4 bg-white/10 animate-pulse rounded w-2/3" />
              </div>
            ) : (
              <div className="text-slate-300 leading-relaxed text-lg italic">
                <ReactMarkdown>
                  {
  currentContent?.real ||
  safeText(
    metadata?.real_world_example,
    "Think how this concept powers modern apps and systems."
  )
}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </motion.div>
        {/* RECOMMENDED VIDEO */}

{currentVideo && (
  <motion.a
    whileHover={{ y: -4 }}
    href={currentVideo.url}
    target="_blank"
    rel="noopener noreferrer"
    className="block bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all"
  >
    <img
      src={currentVideo.thumbnail}
      alt={currentVideo.title}
      className="w-full h-52 object-cover"
    />

    <div className="p-5">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 bg-red-500 rounded-lg text-white">
          ▶
        </div>

        <h4 className="font-bold text-slate-900">
          Recommended Video
        </h4>
      </div>

      <p className="text-slate-700 font-medium">
        {currentVideo.title}
      </p>

      <p className="text-sm text-slate-500 mt-1">
        Watch on YouTube
      </p>
    </div>
  </motion.a>
)}
      </div>
    </div>
  );
}