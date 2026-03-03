// src/renderer/JsonRenderPOC/catalog.tsx
//
// Zod-based component catalog for json-render POC
// Focuses on interactive educational components with state management

import { defineCatalog } from '@json-render/core';
import { schema } from '@json-render/react/schema';
import { z } from 'zod';

// ============ Educational Action Schemas ============

// Evaluation result from backend multi-agent system
const EvaluationResultSchema = z.object({
  is_correct: z.boolean(),
  feedback: z.string(),
  hint: z.string().optional(),
  next_step: z.string().optional(),
  timestamp: z.string(),
});

// Code playground evaluation
export const CodeEvaluationActionSchema = z.object({
  type: z.literal('submit_code_evaluation'),
  payload: z.object({
    playground_id: z.string(),
    user_code: z.string(),
    test_cases: z.array(z.object({
      input: z.string(),
      expected_output: z.string(),
    })),
  }),
  expected_response: z.object({
    evaluation_id: z.string(),
    results: z.array(z.object({
      test_case_id: z.string(),
      passed: z.boolean(),
      actual_output: z.string(),
      error_message: z.string().optional(),
    })),
  }),
});

// Cloze answer verification
export const ClozeVerificationActionSchema = z.object({
  type: z.literal('verify_cloze_answer'),
  payload: z.object({
    cloze_id: z.string(),
    user_answers: z.record(z.string()), // gap_id -> user_answer
    timestamp: z.string(),
  }),
  expected_response: z.object({
    verification_id: z.string(),
    results: z.array(z.object({
      gap_id: z.string(),
      is_correct: z.boolean(),
      correct_answer: z.string(),
      explanation: z.string().optional(),
    })),
    overall_score: z.number(),
  }),
});

// Flashcard progress tracking
export const FlashcardProgressActionSchema = z.object({
  type: z.literal('update_flashcard_progress'),
  payload: z.object({
    flashcard_id: z.string(),
    user_rating: z.enum(['again', 'hard', 'good', 'easy']), // Spaced repetition
    time_spent_seconds: z.number(),
    was_flipped: z.boolean(),
  }),
});

// ============ Component Schemas ============

// Flashcard with flip state and progress
export const FlashcardSchema = z.object({
  type: z.literal('Flashcard'),
  id: z.string(),
  content: z.object({
    front: z.string(),
    back: z.string(),
    hints: z.array(z.string()).optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  }),
  state: z.object({
    is_flipped: z.boolean().default(false),
    review_count: z.number().default(0),
    last_reviewed: z.string().optional(),
  }).optional(),
  actions: z.array(z.any()).optional(), // Will be refined to specific action types
});

// Cloze (fill-in-the-blank) with answer validation
export const ClozeSchema = z.object({
  type: z.literal('Cloze'),
  id: z.string(),
  content: z.string(), // Text with {{gap_id}} placeholders
  gaps: z.array(z.object({
    gap_id: z.string(),
    correct_answer: z.string(),
    alternatives: z.array(z.string()).optional(), // Acceptable variations
    hint: z.string().optional(),
    case_sensitive: z.boolean().default(false),
  })),
  evaluation: z.object({
    auto_verify: z.boolean().default(true),
    show_feedback: z.boolean().default(true),
    max_attempts: z.number().default(3),
  }).optional(),
  actions: z.array(z.any()).optional(),
});

// CodePlayground with tokenizer and test cases
export const CodePlaygroundSchema = z.object({
  type: z.literal('CodePlayground'),
  id: z.string(),
  content: z.object({
    mode: z.enum(['tokenizer', 'hyperparameter']),
    initial_text: z.string().optional(),
    code_template: z.string().optional(),
    language: z.string().default('python'),
  }),
  // Deeply nested test case configuration
  test_cases: z.array(z.object({
    id: z.string(),
    name: z.string(),
    input_code: z.string(),
    expected_output: z.object({
      tokens: z.array(z.object({
        token: z.string(),
        position: z.tuple([z.number(), z.number()]),
        tag: z.string(),
      })),
    }).optional(),
    hyperparameter_config: z.object({
      learning_rate: z.number().optional(),
      epochs: z.number().optional(),
      batch_size: z.number().optional(),
    }).optional(),
    evaluation_criteria: z.array(z.string()),
  })).optional(),
  actions: z.array(z.any()).optional(),
});

// Create catalog using json-render's defineCatalog
export const catalog = defineCatalog(schema, {
  components: {
    Flashcard: {
      props: FlashcardSchema,
      description: 'Interactive flashcard with flip animation',
    },
    Cloze: {
      props: ClozeSchema,
      description: 'Fill-in-the-blank exercise with answer verification',
    },
    CodePlayground: {
      props: CodePlaygroundSchema,
      description: 'Interactive code playground with test cases',
    },
  },
  actions: {
    submit_code_evaluation: {
      description: 'Evaluate user code against test cases via backend multi-agent system',
      handler: async (payload: any) => {
        console.log('[catalog] submit_code_evaluation called with:', payload);
        // This will trigger backend evaluation
        try {
          const response = await fetch('/api/evaluate/code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!response.ok) {
            throw new Error(`Evaluation failed: ${response.statusText}`);
          }
          return await response.json();
        } catch (error) {
          console.error('[catalog] Error in submit_code_evaluation:', error);
          // Return mock result for POC testing
          return {
            evaluation_id: `mock-${Date.now()}`,
            results: [
              {
                test_case_id: 'mock-test-1',
                passed: true,
                actual_output: 'Mock output',
                error_message: undefined,
              },
            ],
          };
        }
      },
    },
    verify_cloze_answer: {
      description: 'Verify cloze gap answers with backend multi-agent feedback',
      handler: async (payload: any) => {
        console.log('[catalog] verify_cloze_answer called with:', payload);
        try {
          const response = await fetch('/api/verify/cloze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!response.ok) {
            throw new Error(`Verification failed: ${response.statusText}`);
          }
          return await response.json();
        } catch (error) {
          console.error('[catalog] Error in verify_cloze_answer:', error);
          // Return mock result for POC testing
          return {
            verification_id: `mock-${Date.now()}`,
            results: Object.entries(payload.user_answers || {}).map(([gap_id, answer]: [string, any]) => ({
              gap_id,
              is_correct: Math.random() > 0.5, // Random for POC
              correct_answer: 'Mock correct answer',
              explanation: 'Mock explanation',
            })),
            overall_score: 75,
          };
        }
      },
    },
    update_flashcard_progress: {
      description: 'Update spaced repetition progress for flashcard',
      handler: async (payload: any) => {
        console.log('[catalog] update_flashcard_progress called with:', payload);
        try {
          const response = await fetch('/api/progress/flashcard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!response.ok) {
            throw new Error(`Progress update failed: ${response.statusText}`);
          }
          return await response.json();
        } catch (error) {
          console.error('[catalog] Error in update_flashcard_progress:', error);
          // Return mock result for POC testing
          return {
            success: true,
            next_review_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          };
        }
      },
    },
  },
});

// ============ Test Data Generators ============

/**
 * Create a test CodePlayground schema with deeply nested structure
 * Useful for testing parser resilience during streaming
 */
export function createTestCodePlaygroundSchema(): z.infer<typeof CodePlaygroundSchema> {
  return {
    type: 'CodePlayground',
    id: 'test-playground-1',
    content: {
      mode: 'tokenizer',
      language: 'python',
      code_template: 'def tokenize(text):\n    # TODO: Implement\n    pass',
    },
    test_cases: [
      {
        id: 'test-1',
        name: 'Simple tokenization',
        input_code: "tokenize('hello world')",
        expected_output: {
          tokens: [
            { token: 'hello', position: [0, 5], tag: 'WORD' },
            { token: 'world', position: [6, 11], tag: 'WORD' },
          ],
        },
        evaluation_criteria: [
          'Tokenizes words correctly',
          'Preserves character positions',
          'Assigns correct POS tags',
        ],
      },
      {
        id: 'test-2',
        name: 'Punctuation handling',
        input_code: "tokenize('hello, world!')",
        expected_output: {
          tokens: [
            { token: 'hello', position: [0, 5], tag: 'WORD' },
            { token: ',', position: [5, 6], tag: 'PUNCT' },
            { token: 'world', position: [7, 12], tag: 'WORD' },
            { token: '!', position: [12, 13], tag: 'PUNCT' },
          ],
        },
        evaluation_criteria: [
          'Separates punctuation from words',
          'Preserves original spacing',
        ],
      },
    ],
    actions: [
      {
        type: 'submit_code_evaluation',
        payload: {
          playground_id: 'test-playground-1',
          user_code: '',
          test_cases: [],
        },
      },
    ],
  };
}

/**
 * Create a test Cloze schema with multiple gaps
 * Useful for testing state preservation during streaming
 */
export function createTestClozeSchema(): z.infer<typeof ClozeSchema> {
  return {
    type: 'Cloze',
    id: 'test-cloze-1',
    content: 'Machine learning is a subset of {{gap1}} that enables computers to {{gap2}} from data. The main types are {{gap3}} learning, {{gap4}} learning, and {{gap5}} learning.',
    gaps: [
      {
        gap_id: 'gap1',
        correct_answer: 'artificial intelligence',
        alternatives: ['AI'],
        case_sensitive: false,
        hint: 'Think of the broader field',
      },
      {
        gap_id: 'gap2',
        correct_answer: 'learn',
        alternatives: ['improve', 'adapt'],
        case_sensitive: false,
        hint: 'What do students do in school?',
      },
      {
        gap_id: 'gap3',
        correct_answer: 'supervised',
        case_sensitive: false,
        hint: 'Uses labeled data',
      },
      {
        gap_id: 'gap4',
        correct_answer: 'unsupervised',
        case_sensitive: false,
        hint: 'Finds patterns without labels',
      },
      {
        gap_id: 'gap5',
        correct_answer: 'reinforcement',
        case_sensitive: false,
        hint: 'Uses rewards and punishments',
      },
    ],
    evaluation: {
      auto_verify: true,
      show_feedback: true,
      max_attempts: 3,
    },
    actions: [
      {
        type: 'verify_cloze_answer',
        payload: {
          cloze_id: 'test-cloze-1',
          user_answers: {},
          timestamp: '',
        },
      },
    ],
  };
}

/**
 * Create a test Flashcard schema
 * Useful for testing flip state and progress tracking
 */
export function createTestFlashcardSchema(): z.infer<typeof FlashcardSchema> {
  return {
    type: 'Flashcard',
    id: 'test-flashcard-1',
    content: {
      front: 'What is the difference between supervised and unsupervised learning?',
      back: 'Supervised learning uses labeled data to learn patterns, while unsupervised learning finds patterns in unlabeled data without explicit guidance.',
      hints: [
        'Think about the presence or absence of labels',
        'Consider the role of feedback during training',
      ],
      difficulty: 'intermediate',
    },
    state: {
      is_flipped: false,
      review_count: 0,
    },
    actions: [
      {
        type: 'update_flashcard_progress',
        payload: {
          flashcard_id: 'test-flashcard-1',
          user_rating: 'good',
          time_spent_seconds: 0,
          was_flipped: false,
        },
      },
    ],
  };
}
