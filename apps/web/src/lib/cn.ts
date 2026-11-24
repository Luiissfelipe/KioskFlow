import { createCn } from 'cn/config';

const FONT_SIZE_TOKENS = [
  'meta',
  'body',
  'title',
  'heading',
  'kds-ticket',
  'board-label',
  'board-brand',
  'board-title',
  'ticket',
  'board-ticket',
];

export const cn = createCn({ extend: { theme: { text: FONT_SIZE_TOKENS } } });
