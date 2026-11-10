import { Score } from '../exercises/exerciseModels';

export function helpLabel({ hint, expected, attempts }: Pick<Score, 'hint' | 'expected' | 'attempts'>): string {
  const parts = [hint && 'hint', expected && 'expected', attempts > 0 && `${attempts} wrong`].filter(Boolean);
  return parts.length ? parts.join(' · ') : '—';
}
