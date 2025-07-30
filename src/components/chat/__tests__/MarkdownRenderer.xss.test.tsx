import React from 'react';
import { render } from '@testing-library/react';
import MarkdownRenderer from '../MarkdownRenderer';

describe('MarkdownRenderer XSS Prevention', () => {
  describe('Script injection prevention', () => {
    it('should strip script tags', () => {
      const maliciousContent = 'Hello <script>alert("XSS")</script> World';
      const { container } = render(<MarkdownRenderer content={maliciousContent} />);
      
      expect(container.textContent).toBe('Hello  World');
      expect(container.innerHTML).not.toContain('<script>');
      expect(container.innerHTML).not.toContain('alert');
    });

    it('should strip inline event handlers', () => {
      const maliciousContent = 'Click <a href="#" onclick="alert(\'XSS\')">here</a>';
      const { container } = render(<MarkdownRenderer content={maliciousContent} />);
      
      expect(container.innerHTML).not.toContain('onclick');
      expect(container.innerHTML).not.toContain('alert');
    });

    it('should strip javascript: URLs', () => {
      const maliciousContent = 'Click <a href="javascript:alert(\'XSS\')">here</a>';
      const { container } = render(<MarkdownRenderer content={maliciousContent} />);
      
      expect(container.innerHTML).not.toContain('javascript:');
      expect(container.innerHTML).not.toContain('alert');
    });

    it('should strip data: URLs with scripts', () => {
      const maliciousContent = '<a href="data:text/html,<script>alert(\'XSS\')</script>">link</a>';
      const { container } = render(<MarkdownRenderer content={maliciousContent} />);
      
      expect(container.innerHTML).not.toContain('data:');
      expect(container.innerHTML).not.toContain('script');
    });

    it('should strip style tags with malicious content', () => {
      const maliciousContent = '<style>body { background: url("javascript:alert(\'XSS\')"); }</style>';
      const { container } = render(<MarkdownRenderer content={maliciousContent} />);
      
      expect(container.innerHTML).not.toContain('<style>');
      expect(container.innerHTML).not.toContain('javascript:');
    });

    it('should strip iframe tags', () => {
      const maliciousContent = '<iframe src="https://evil.com"></iframe>';
      const { container } = render(<MarkdownRenderer content={maliciousContent} />);
      
      expect(container.innerHTML).not.toContain('<iframe');
      expect(container.innerHTML).not.toContain('evil.com');
    });

    it('should strip form tags', () => {
      const maliciousContent = '<form action="https://evil.com"><input type="text" /></form>';
      const { container } = render(<MarkdownRenderer content={maliciousContent} />);
      
      expect(container.innerHTML).not.toContain('<form');
      expect(container.innerHTML).not.toContain('<input');
    });

    it('should handle XSS in markdown bold syntax', () => {
      const maliciousContent = '**Hello <script>alert("XSS")</script> World**';
      const { container } = render(<MarkdownRenderer content={maliciousContent} />);
      
      expect(container.innerHTML).not.toContain('<script>');
      expect(container.innerHTML).not.toContain('alert');
      expect(container.innerHTML).toContain('<strong>');
    });
  });

  describe('Markdown functionality preservation', () => {
    it('should preserve bold formatting with **', () => {
      const content = 'This is **bold** text';
      const { container } = render(<MarkdownRenderer content={content} />);
      
      expect(container.innerHTML).toContain('<strong>bold</strong>');
    });

    it('should preserve bold formatting with __', () => {
      const content = 'This is __bold__ text';
      const { container } = render(<MarkdownRenderer content={content} />);
      
      expect(container.innerHTML).toContain('<strong>bold</strong>');
    });

    it('should preserve line breaks', () => {
      const content = 'Line 1\nLine 2';
      const { container } = render(<MarkdownRenderer content={content} />);
      
      expect(container.innerHTML).toContain('<br');
    });

    it('should preserve paragraph breaks', () => {
      const content = 'Paragraph 1\n\nParagraph 2';
      const { container } = render(<MarkdownRenderer content={content} />);
      
      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs.length).toBe(2);
    });

    it('should allow safe HTML tags', () => {
      const content = 'This has <strong>strong</strong> and <em>emphasis</em>';
      const { container } = render(<MarkdownRenderer content={content} />);
      
      expect(container.innerHTML).toContain('<strong>strong</strong>');
      expect(container.innerHTML).toContain('<em>emphasis</em>');
    });

    it('should allow safe links with href', () => {
      const content = '<a href="https://example.com">Safe link</a>';
      const { container } = render(<MarkdownRenderer content={content} />);
      
      const link = container.querySelector('a');
      expect(link).toBeTruthy();
      expect(link?.getAttribute('href')).toBe('https://example.com');
    });
  });

  describe('Complex XSS scenarios', () => {
    it('should handle nested XSS attempts', () => {
      const maliciousContent = '<div><div><script>alert("XSS")</script></div></div>';
      const { container } = render(<MarkdownRenderer content={maliciousContent} />);
      
      expect(container.innerHTML).not.toContain('<script>');
      expect(container.innerHTML).toContain('<div><div></div></div>');
    });

    it('should handle encoded XSS attempts', () => {
      const maliciousContent = '&lt;script&gt;alert("XSS")&lt;/script&gt;';
      const { container } = render(<MarkdownRenderer content={maliciousContent} />);
      
      // Should display the encoded text safely
      expect(container.textContent).toContain('<script>alert("XSS")</script>');
      expect(container.innerHTML).not.toContain('<script>alert');
    });

    it('should handle mixed markdown and XSS', () => {
      const maliciousContent = {
        segments: [
          { text: '**Important:** Click <a href="javascript:alert(\'XSS\')">here</a>' },
          { text: 'Normal text with <script>alert("XSS")</script>' }
        ],
        citations: []
      };
      
      const { container } = render(<MarkdownRenderer content={maliciousContent} />);
      
      expect(container.innerHTML).toContain('<strong>Important:</strong>');
      expect(container.innerHTML).not.toContain('javascript:');
      expect(container.innerHTML).not.toContain('<script>');
    });
  });
});