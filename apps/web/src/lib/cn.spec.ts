import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { cn } from '@/lib/cn';

const globalsCss = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
const FONT_SIZE_DECLARATION = /--text-([a-z]+(?:-[a-z]+)*):\s*[\d.]+rem/g;
const fontSizeTokens = Array.from(globalsCss.matchAll(FONT_SIZE_DECLARATION), ([, token = '']) => token);

describe('cn', () => {
  it('finds the font size tokens declared in globals.css', () => {
    expect(fontSizeTokens).toEqual(expect.arrayContaining(['meta', 'title', 'board-ticket']));
  });

  it.each(fontSizeTokens)('keeps the %s font size next to a text color', (token) => {
    expect(cn(`text-${token}`, 'text-foreground')).toBe(`text-${token} text-foreground`);
  });

  it('keeps a text color followed by a font size', () => {
    expect(cn('text-muted-foreground', 'text-title')).toBe('text-muted-foreground text-title');
  });

  it('replaces a font size with a later font size', () => {
    expect(cn('text-meta', 'text-title')).toBe('text-title');
  });

  it('replaces a text color with a later text color', () => {
    expect(cn('text-foreground', 'text-background')).toBe('text-background');
  });

  it('keeps the last of two conflicting minimum heights', () => {
    expect(cn('min-h-(--target-client)', 'min-h-12')).toBe('min-h-12');
  });
});
