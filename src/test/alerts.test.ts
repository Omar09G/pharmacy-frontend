import { describe, it, expect } from 'vitest';
import DOMPurify from 'dompurify';

// The sanitize() helper in alerts.ts is private, but we can directly test the
// DOMPurify configuration used in that module to confirm XSS stripping works.
describe('DOMPurify sanitization (alerts.ts behavior)', () => {
  const sanitize = (value: string) =>
    DOMPurify.sanitize(value, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });

  it('strips script tags', () => {
    const input = '<script>alert("xss")</script>hello';
    expect(sanitize(input)).toBe('hello');
  });

  it('strips img onerror payloads', () => {
    const input = '<img src=x onerror="alert(1)">';
    expect(sanitize(input)).toBe('');
  });

  it('strips anchor tags while keeping text', () => {
    const input = '<a href="evil.com">Click me</a>';
    expect(sanitize(input)).toBe('Click me');
  });

  it('passes plain text through unchanged', () => {
    const input = 'Paracetamol 500mg';
    expect(sanitize(input)).toBe('Paracetamol 500mg');
  });

  it('strips all HTML attributes', () => {
    const input = '<b style="color:red" onclick="evil()">bold text</b>';
    expect(sanitize(input)).toBe('bold text');
  });

  it('handles empty string', () => {
    expect(sanitize('')).toBe('');
  });

  it('handles numeric-like strings (safe for confirmSale)', () => {
    expect(sanitize('149.99')).toBe('149.99');
  });

  it('strips SVG with embedded script', () => {
    const input = '<svg><script>alert(1)</script></svg>';
    // ALLOWED_TAGS: [] strips everything
    expect(sanitize(input)).not.toContain('<script>');
  });
});
