import { describe, expect, test } from 'bun:test';
import { interpretRegister } from './registerResponse';

describe('interpretRegister', () => {
  test('registers on a 200 with a token', () => {
    const r = interpretRegister(200, '{"token":"t0","name":"Bob","message":"Welcome"}', 'bob');
    expect(r).toEqual({ registered: true, name: 'Bob', token: 't0', message: 'Welcome' });
  });

  test('falls back to the typed name when the body omits one', () => {
    const r = interpretRegister(200, '{"token":"t0"}', '  bob ');
    expect(r).toMatchObject({ registered: true, name: 'bob' });
  });

  test('surfaces the server message on a rejection', () => {
    const r = interpretRegister(409, '{"message":"Name already taken"}', 'bob');
    expect(r).toEqual({ registered: false, message: 'Name already taken' });
  });

  test('empty body yields a friendly message, not a JSON error', () => {
    const r = interpretRegister(500, '', 'bob');
    expect(r.registered).toBe(false);
    expect(r.message).not.toContain('JSON');
    expect(r.message).toContain('500');
  });

  test('non-JSON body does not register and does not throw', () => {
    const r = interpretRegister(200, 'Bad Gateway', 'bob');
    expect(r.registered).toBe(false);
    expect(r.message.length).toBeGreaterThan(0);
  });
});
