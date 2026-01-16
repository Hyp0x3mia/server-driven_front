// src/types/interactive-content.ts

/**
 * Represents a standard block of Markdown content.
 */
export interface MarkdownContent {
  type: 'markdown';
  content: string; // A string containing Markdown text
}

/**
 * Represents the structure for a single flashcard.
 */
export interface FlashcardContent {
  type: 'flashcard';
  id: string; // A unique identifier for the flashcard
  front: {
    title?: string;
    content: string; // Content for the front face (can be Markdown)
  };
  back: {
    title?: string;
    content: string; // Content for the back face (can be Markdown)
  };
}

/**
 * A union type representing any possible item in the interactive content stream.
 */
export type InteractiveContentItem = MarkdownContent | FlashcardContent;

/**
 * Defines the entire structure for a server-driven article, which is a stream
 * of different content items.
 */
export type InteractiveArticle = InteractiveContentItem[];
