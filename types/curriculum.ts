export type Grade = 6 | 7 | 8;
export type Subject = 'geometry' | 'statistics';
export type CPAPhase = 'concrete' | 'visual' | 'abstract';

export interface NarrativeContext {
  setting: string;
  character?: string;
  problemStatement: string;
  realWorldConnection: string;
}

/** A named wrong-answer pattern — detected and shown immediately after a bad numeric submission */
export interface ErrorPattern {
  match: (userAnswer: number) => boolean;
  label: string;       // short name: "Added run + rise directly"
  explanation: string; // one-sentence coaching shown to the student
}

export interface FormativeCheck {
  prompt: string;
  type: 'numeric' | 'multiple-choice' | 'drag-to-match';
  correctAnswer?: number;
  tolerance?: number;       // accept ± tolerance% (default 10)
  choices?: { label: string; correct: boolean }[];
  errorPatterns?: ErrorPattern[];  // numeric checks: named wrong-answer detectors
  solutionReveal?: string;         // shown verbatim after all hints exhausted + stuck
  hints?: string[];                // per-check hints (for extraChecks; phases use phase-level hints)
}

export interface GuidedStep {
  instruction: string; // what to do on the canvas
  explanation: string; // why — the concept being shown
}

export interface GuidedExample {
  intro: string;
  steps: GuidedStep[];
  completionMessage: string;
}

export interface CPAPhaseConfig {
  phase: CPAPhase;
  instructionText: string;
  canvasComponent: string;
  canvasInitialState: Record<string, unknown>;
  formativeCheck: FormativeCheck;
  extraChecks?: FormativeCheck[];  // additional practice problems; all shown before advancing
  passThreshold?: number;          // min correct to meet mastery (default 1); never blocks
  hint?: string;
  hints?: string[];                // 3-level progressive hints for the primary formativeCheck
  guidedExample?: GuidedExample;
}

/** Shown after all 3 CPA phases complete — connects the three representations */
export interface PhaseBridgeSummary {
  buildItCaption: string;  // what the concrete phase did
  seeItCaption: string;    // what the visual phase revealed
  ownItCaption: string;    // the formula / rule
  keyInsight: string;      // 2-sentence synthesis of all three
}

export interface Lesson {
  id: string;
  topicId: string;
  title: string;
  narrative: NarrativeContext;
  estimatedMinutes: number;
  phases: CPAPhaseConfig[];
  phaseBridge?: PhaseBridgeSummary;
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
  icon: string;
  color: string;
}
