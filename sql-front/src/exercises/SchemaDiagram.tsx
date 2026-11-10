import { useEffect, useRef, useState } from "react";
import { diagrams, toMermaid } from "./diagrams";

const themeVariables = {
  darkMode: true,
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  background: '#1f170f',
  mainBkg: '#241a11',
  primaryColor: '#241a11',
  primaryBorderColor: '#4a3820',
  nodeBorder: '#4a3820',
  primaryTextColor: '#f0e2c2',
  textColor: '#d6c49e',
  titleColor: '#e9b44c',
  lineColor: '#c47a35',
  tertiaryColor: '#16100a',
};

export function SchemaDiagram({ game }: { game: string }) {
  const model = diagrams[game];
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!model) return;
    let active = true;
    (async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({ startOnLoad: false, theme: 'base', themeVariables, er: { useMaxWidth: true } });
        const { svg } = await mermaid.render(`df-er-${game}`, toMermaid(model));
        if (active && host.current) host.current.innerHTML = svg;
      } catch (err) {
        console.error('Could not render schema diagram', err);
        if (active) setFailed(true);
      }
    })();
    return () => { active = false; };
  }, [game, model]);

  if (!model) {
    return <p className="df-diagram-empty">No diagram for this game.</p>;
  }
  if (failed) {
    return <p className="df-diagram-empty">Could not render the diagram.</p>;
  }
  return <div className="df-diagram" ref={host} />;
}
