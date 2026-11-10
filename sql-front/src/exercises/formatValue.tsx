import { ReactNode } from "react";

/** Shared by the plain result table and the result diff so values render identically. */
export function formatValue(value: unknown): { node: ReactNode; alignRight: boolean } {
  if (typeof value === 'boolean')
    return { node: value.toString(), alignRight: false };

  if (value === null)
    return { node: <i>NULL</i>, alignRight: false };

  if (typeof value === 'object')
    return { node: JSON.stringify(value), alignRight: false };

  const text = String(value);

  if (typeof value === 'string' && (text.includes(' ') || text[0] === '+'))
    return { node: text, alignRight: false };

  if (typeof value === 'string' && text.indexOf('-') !== -1 && text.indexOf('-') !== text.lastIndexOf('-'))
    return { node: text, alignRight: false };

  if (!isNaN(parseInt(text)) && text[text.length - 1] !== '%')
    return { node: (+text).toLocaleString("nl-BE"), alignRight: true };

  return { node: text, alignRight: false };
}
