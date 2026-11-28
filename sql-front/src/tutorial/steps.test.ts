import { describe, expect, test } from 'bun:test';
import { Glob } from 'bun';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { STEPS } from './steps';

const src = join(import.meta.dir, '..');
const tagged = new Set(
  [...new Glob('**/*.tsx').scanSync(src)]
    .flatMap(file => [...readFileSync(join(src, file), 'utf8').matchAll(/data-tour="([^"]+)"/g)].map(m => m[1])),
);
const anchors = STEPS.flatMap(step => [step, ...(step.enter ?? []), ...(step.actions ?? [])])
  .flatMap(target => [target.anchor, target.narrowAnchor])
  .filter((anchor): anchor is string => anchor !== undefined);

describe('steps', () => {
  test.each([...new Set(anchors)])('anchor "%s" is a data-tour attribute in the app', anchor => {
    expect(tagged.has(anchor)).toBe(true);
  });
});
