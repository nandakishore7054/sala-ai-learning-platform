export type LearningStyle = 'visual' | 'auditory' | 'kinesthetic' | 'none';
export type UserRole = 'student' | 'teacher';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  learningStyle: LearningStyle;
  domain?: string;
  points: number;
  badges: string[];
}

export interface Course {
  course_id: string;
  course_title: string;
  ai_explanation: string;
  diagram_description: string;
  youtube_video_suggestion: string;
  activity: string;
  estimated_time: string;
  visual_learning_metadata?: {
    image_url?: string;
    visual_tip?: string;
    concept_map_summary?: string;
    real_world_example?: string;
    visual_explanation?: string;
  };
}

export interface Module {
  module_id: string;
  module_title: string;
  courses: Course[];
}

export interface DomainData {
  domain: string;
  modules: Module[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
}

export interface QuizData {
  module: string;
  quiz: QuizQuestion[];
}

export interface Progress {
  userId: string;
  moduleId: string;
  courseId: string;
  completed: boolean;
  completedAt: any;
  pointsEarned: number;
}

export interface QuizResult {
  userId: string;
  moduleId: string;
  score: number;
  completedAt: any;
}

export interface UserStats {
  userId: string;
  completedModules: string[];
  points: number;
  badges: string[];
}
