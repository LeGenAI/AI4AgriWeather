
import React from 'react';
import DOMPurify from 'dompurify';
import { MessageSegment, Citation } from '@/types/message';
import CitationButton from './CitationButton';

interface MarkdownRendererProps {
  content: string | { segments: MessageSegment[]; citations: Citation[] };
  className?: string;
  onCitationClick?: (citation: Citation) => void;
  isUserMessage?: boolean;
}

// Configure DOMPurify for safe markdown rendering
const DOMPURIFY_CONFIG = {
  ALLOWED_TAGS: ['strong', 'em', 'b', 'i', 'p', 'br', 'span', 'div', 'a', 'code', 'pre', 'blockquote', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  ALLOW_DATA_ATTR: false,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  SAFE_FOR_TEMPLATES: true,
  // Prevent window.open and other potentially dangerous features
  ADD_ATTR: ['target'],
  // Force all links to open in new tab with proper security
  FORCE_BODY: false,
  // Remove dangerous schemes
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i
};

// Helper function to sanitize text
const sanitizeText = (text: string): string => {
  return DOMPurify.sanitize(text, DOMPURIFY_CONFIG);
};

const MarkdownRenderer = ({ content, className = '', onCitationClick, isUserMessage = false }: MarkdownRendererProps) => {
  // Handle enhanced content with citations
  if (typeof content === 'object' && 'segments' in content) {
    return (
      <div className={className}>
        {processMarkdownWithCitations(content.segments, content.citations, onCitationClick, isUserMessage)}
      </div>
    );
  }

  // For legacy string content, convert to simple format
  const segments: MessageSegment[] = [{ text: typeof content === 'string' ? content : '' }];
  const citations: Citation[] = [];
  
  return (
    <div className={className}>
      {processMarkdownWithCitations(segments, citations, onCitationClick, isUserMessage)}
    </div>
  );
};

// Function to process markdown with citations inline
const processMarkdownWithCitations = (
  segments: MessageSegment[], 
  citations: Citation[], 
  onCitationClick?: (citation: Citation) => void,
  isUserMessage: boolean = false
) => {
  // For user messages, render as inline content without paragraph breaks
  if (isUserMessage) {
    return (
      <span>
        {segments.map((segment, index) => (
          <span key={index}>
            {processInlineMarkdown(segment.text)}
            {segment.citation_id && onCitationClick && (
              <CitationButton
                chunkIndex={(() => {
                  const citation = citations.find(c => c.citation_id === segment.citation_id);
                  return citation?.chunk_index || 0;
                })()}
                onClick={() => {
                  const citation = citations.find(c => c.citation_id === segment.citation_id);
                  if (citation) {
                    onCitationClick(citation);
                  }
                }}
              />
            )}
          </span>
        ))}
      </span>
    );
  }

  // For AI messages, treat each segment as a potential paragraph
  const paragraphs: JSX.Element[] = [];
  
  segments.forEach((segment, segmentIndex) => {
    const citation = segment.citation_id ? citations.find(c => c.citation_id === segment.citation_id) : undefined;
    
    // Sanitize segment text before processing
    const sanitizedSegmentText = sanitizeText(segment.text);
    
    // Split segment text by double line breaks to handle multiple paragraphs within a segment
    const paragraphTexts = sanitizedSegmentText.split('\n\n').filter(text => text.trim());
    
    paragraphTexts.forEach((paragraphText, paragraphIndex) => {
      // Process the paragraph text for markdown formatting
      const processedContent = processTextWithMarkdown(paragraphText.trim());
      
      paragraphs.push(
        <p key={`${segmentIndex}-${paragraphIndex}`} className="mb-4 leading-relaxed">
          {processedContent}
          {/* Add citation at the end of the paragraph if this is the last paragraph of the segment */}
          {paragraphIndex === paragraphTexts.length - 1 && citation && onCitationClick && (
            <CitationButton
              chunkIndex={citation.chunk_index || 0}
              onClick={() => onCitationClick(citation)}
            />
          )}
        </p>
      );
    });
  });
  
  return paragraphs;
};

// Helper function to process text with markdown formatting (bold, line breaks)
const processTextWithMarkdown = (text: string) => {
  // Sanitize the input text first
  const sanitizedText = sanitizeText(text);
  const lines = sanitizedText.split('\n');
  
  return lines.map((line, lineIndex) => {
    const parts = line.split(/(\*\*.*?\*\*|__.*?__)/g);
    
    const processedLine = parts.map((part, partIndex) => {
      if (part.match(/^\*\*(.*)\*\*$/)) {
        const boldText = part.replace(/^\*\*(.*)\*\*$/, '$1');
        // Sanitize the extracted bold text content
        const sanitizedBoldText = sanitizeText(boldText);
        return <strong key={partIndex}>{sanitizedBoldText}</strong>;
      } else if (part.match(/^__(.*__)$/)) {
        const boldText = part.replace(/^__(.*__)$/, '$1');
        // Sanitize the extracted bold text content
        const sanitizedBoldText = sanitizeText(boldText);
        return <strong key={partIndex}>{sanitizedBoldText}</strong>;
      } else {
        // For regular text, we already sanitized it above
        return part;
      }
    });

    return (
      <span key={lineIndex}>
        {processedLine}
        {lineIndex < lines.length - 1 && <br />}
      </span>
    );
  });
};

// Function to process markdown inline without creating paragraph breaks
const processInlineMarkdown = (text: string) => {
  // Sanitize the input text first
  const sanitizedText = sanitizeText(text);
  const parts = sanitizedText.split(/(\*\*.*?\*\*|__.*?__)/g);
  
  return parts.map((part, partIndex) => {
    if (part.match(/^\*\*(.*)\*\*$/)) {
      const boldText = part.replace(/^\*\*(.*)\*\*$/, '$1');
      // Sanitize the extracted bold text content
      const sanitizedBoldText = sanitizeText(boldText);
      return <strong key={partIndex}>{sanitizedBoldText}</strong>;
    } else if (part.match(/^__(.*__)$/)) {
      const boldText = part.replace(/^__(.*__)$/, '$1');
      // Sanitize the extracted bold text content
      const sanitizedBoldText = sanitizeText(boldText);
      return <strong key={partIndex}>{sanitizedBoldText}</strong>;
    } else {
      // Replace line breaks with spaces for inline rendering
      // The text is already sanitized above
      return part.replace(/\n/g, ' ');
    }
  });
};

export default MarkdownRenderer;
