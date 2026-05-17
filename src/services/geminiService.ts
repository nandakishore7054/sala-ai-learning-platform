import Groq from "groq-sdk";
import { LearningStyle, QuizData, DomainData } from "../types";

function cleanJSON(text: string) {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

// -------------------- DOMAIN DATA --------------------

export async function generateDomainData(
  domain: string,
  learningStyle: LearningStyle
): Promise<DomainData> {
  try {
    const prompt = `
Generate a premium AI-powered learning path for ${domain}.

Student learning style:
${learningStyle}

Requirements:
- Generate 10 modules
- Each module should contain 3-5 beginner-to-advanced courses
- Make learning highly engaging
- Make explanations modern and practical

For every course generate:
- course_title
- ai_explanation
- diagram_description
- youtube_video_suggestion
- activity
- estimated_time

ALSO generate visual learning metadata:
- visual_tip
- concept_map_summary
- real_world_example
- visual_explanation

Learning style adaptation:
- VISUAL → diagrams, imagery, flow explanations
- AUDITORY → conversational explanations
- KINESTHETIC → practical activities & hands-on learning

Return ONLY valid JSON.

{
  "domain": "",
  "modules": [
    {
      "module_id": "",
      "module_title": "",
      "courses": [
        {
          "course_id": "",
          "course_title": "",
          "ai_explanation": "",
          "diagram_description": "",
          "youtube_video_suggestion": "",
          "activity": "",
          "estimated_time": "",
          "visual_learning_metadata": {
            "visual_tip": "",
            "concept_map_summary": "",
            "real_world_example": "",
            "visual_explanation": ""
          }
        }
      ]
    }
  ]
}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are an elite AI education system creating premium adaptive learning experiences.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.9,
      max_tokens: 4000,
    });

    const text = completion.choices[0]?.message?.content || "{}";

    return JSON.parse(cleanJSON(text));
  } catch (error) {
    console.error("Groq Domain Error:", error);

    return {
      domain,
      modules: [],
    };
  }
}

// -------------------- QUIZ --------------------

export async function generateQuiz(
  moduleTitle: string
): Promise<QuizData> {
  try {
    const prompt = `
Generate a smart adaptive quiz for:
"${moduleTitle}"

Rules:
- 5 MCQ questions
- 4 options each
- medium difficulty
- practical understanding based
- avoid repeated questions

Return ONLY valid JSON:

{
  "module": "",
  "quiz": [
    {
      "question": "",
      "options": ["", "", "", ""],
      "correct_answer": ""
    }
  ]
}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are an AI educational assessment generator.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1200,
    });

    const text = completion.choices[0]?.message?.content || "{}";

    return JSON.parse(cleanJSON(text));
  } catch (error) {
    console.error("Groq Quiz Error:", error);

    return {
      module: moduleTitle,
      quiz: [],
    };
  }
}

// -------------------- DYNAMIC AI HINTS --------------------

export async function getHint(
  question: string,
  selectedAnswer: string,
  correctAnswer: string,
  learningStyle: LearningStyle,
  attempt: number = 1
) {
  try {
    const prompt = `
You are an adaptive AI tutor.

Question:
${question}

Student Answer:
${selectedAnswer}

Correct Answer:
${correctAnswer}

Learning Style:
${learningStyle}

Wrong Attempt Number:
${attempt}

Rules:
- NEVER reveal answer directly
- Every attempt should provide DIFFERENT hint
- Attempt 1 → subtle clue
- Attempt 2 → guided clue
- Attempt 3 → strong conceptual direction
- Keep hints short
- Encourage critical thinking
- Add emojis naturally
- Personalized to learning style

Maximum 25 words.
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a premium AI tutor helping students think independently.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 1.2,
      max_tokens: 80,
    });

    return (
      completion.choices[0]?.message?.content ||
      "Think carefully about the core concept 🤔"
    );
  } catch (error) {
    console.error("Groq Hint Error:", error);

    return "Focus on the concept step-by-step 🔍";
  }
}

// -------------------- AI RECOMMENDATIONS --------------------

export async function getRecommendations(
  learningStyle: LearningStyle,
  completedModules: string[]
) {
  try {
    const prompt = `
You are SALA AI Mentor.

Student Profile:
- Learning style: ${learningStyle}
- Completed modules:
${
  completedModules.length > 0
    ? completedModules.join(", ")
    : "No modules completed yet"
}

Generate:
3 personalized recommendations.

Requirements:
- Sound like a REAL AI mentor
- Modern startup style
- Personalized to learning style
- Short & premium looking
- Add emojis
- No markdown symbols like **
- Mention WHY recommendation helps
- Give NEXT STEP

Example style:

🎥 Visual Boost
IMPORTANT: Diagrams improve memory retention for visual learners.

NEXT STEP:
Explore Binary Tree animations and sketch node connections.

Keep response concise and engaging.
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a modern AI mentor inside a premium adaptive learning app.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 1.1,
      max_tokens: 350,
    });

    return (
      completion.choices[0]?.message?.content ||
      "🚀 Continue learning consistently."
    );
  } catch (error) {
    console.error("Groq Recommendation Error:", error);

    return `
🎯 Revision Boost
IMPORTANT: Revisiting concepts improves retention.

NEXT STEP:
Review previously completed lessons.

🧠 Practice Challenge
IMPORTANT: Active practice strengthens memory.

NEXT STEP:
Solve 3 beginner-level problems.

🚀 Skill Growth
IMPORTANT: Consistency builds mastery.

NEXT STEP:
Explore one advanced topic today.
`;
  }
}

// -------------------- VISUAL LEARNING ENHANCEMENTS --------------------

export async function getVisualEnhancements(
  courseTitle: string,
  domain: string,
  learningStyle: LearningStyle
) {
  try {
    const prompt = `
You are an elite visual learning AI tutor inside a modern adaptive learning platform.

Generate highly visual explanations for this topic.

TOPIC:
${courseTitle}

DOMAIN:
${domain}

LEARNING STYLE:
${learningStyle}

IMPORTANT RULES:
- Think like GeeksForGeeks visual explanations
- Use analogies
- Use visual imagination
- Use structured mental models
- Make explanations beginner friendly
- Avoid technical overload
- Make explanations visually descriptive
- Do NOT return markdown
- Do NOT return code blocks

Return ONLY valid JSON.

JSON FORMAT:
{
  "visual_tip": "short visual memory trick",
  "concept_map_summary": {
    "Main Concept": ["sub concept 1", "sub concept 2"]
  },
  "real_world_example": "real world analogy",
  "visual_explanation": "very visual beginner explanation"
}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are an AI visual learning expert helping students understand concepts visually.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 1,
      max_tokens: 500,
    });

    const text = completion.choices[0]?.message?.content || "{}";

try {
  return JSON.parse(cleanJSON(text));
} catch (parseError) {
  console.error("JSON Parse Error:", parseError);

  return {
    visual_tip:
      "Focus on identifying patterns and relationships visually 👀",

    concept_map_summary:
      "Break the concept into smaller connected visual blocks for easier understanding.",

    real_world_example:
      "Think about how this concept appears in real applications you use daily.",

    visual_explanation:
      "Imagine the flow step-by-step like a visual roadmap connecting each idea together.",
  };
}
  } catch (error) {
    console.error("Visual Enhancement Error:", error);

    return null;
  }
}