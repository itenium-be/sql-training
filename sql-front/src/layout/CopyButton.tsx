import { useState } from 'react';
import { copyText } from './copyText';

export function CopyButton({ text }: { text: string | undefined }) {
  const [copied, setCopied] = useState(false);
  if (!text) return null;
  const copy = () => copyText(text).then(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  });
  return <button type="button" className="df-copy" onClick={copy}>{copied ? 'Copied ✓' : 'Copy'}</button>;
}
