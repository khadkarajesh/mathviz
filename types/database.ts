export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Problem {
  id: string;
  topic_id: string;
  lesson_id: string;
  phase: string;
  prompt: string;
  answer: number | null;
  choices: string[] | null;
  hints: string[];
  solution: string;
  canvas_config: {
    pointA?: { x: number; y: number };
    pointB?: { x: number; y: number };
  } | null;
  difficulty: number;
  validated: boolean;
  created_at: string;
}

export interface SkillState {
  id: string;
  user_id: string;
  topic_id: string;
  lesson_id: string;
  phase: string;
  repetitions: number;
  ease_factor: number;
  interval_days: number;
  next_review_at: string | null;
  last_reviewed_at: string | null;
  mastered: boolean;
}

export interface Attempt {
  id: string;
  user_id: string;
  problem_id: string;
  topic_id: string;
  lesson_id: string;
  phase: string;
  correct: boolean;
  answer_given: number | null;
  hints_used: number;
  time_seconds: number | null;
  ai_error_label: string | null;
  created_at: string;
}

export interface DailyActivity {
  id: string;
  user_id: string;
  date: string;
  lessons_completed: number;
  problems_attempted: number;
  problems_correct: number;
  streak_day: number;
}
