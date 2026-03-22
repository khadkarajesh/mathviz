export type Grade = 6 | 7 | 8;
export type Subject = 'geometry' | 'statistics';
export type CPAPhase = 'concrete' | 'visual' | 'abstract';

export interface NarrativeContext {
  setting: string;
  character?: string;
  problemStatement: string;
  realWorldConnection: string;
}

export interface FormativeCheck {
  prompt: string;
  type: 'numeric' | 'multiple-choice' | 'drag-to-match';
  correctAnswer?: number;
  tolerance?: number; // accept ± tolerance%
  choices?: { label: string; correct: boolean }[];
}

export interface CPAPhaseConfig {
  phase: CPAPhase;
  instructionText: string;
  canvasComponent: string; // key in canvas registry
  canvasInitialState: Record<string, unknown>;
  formativeCheck: FormativeCheck;
  hint?: string;
}

export interface Lesson {
  id: string;
  topicId: string;
  title: string;
  narrative: NarrativeContext;
  estimatedMinutes: number;
  phases: CPAPhaseConfig[];
}

export interface CurriculumTopic {
  id: string;
  subject: Subject;
  title: string;
  description: string;
  grades: Grade[];
  standards: string[];
  lessons: Lesson[];
  prerequisiteTopicIds: string[];
  icon: string; // emoji or icon name
  color: string; // tailwind color class suffix
}
