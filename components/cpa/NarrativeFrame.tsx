import { NarrativeContext } from '@/types/curriculum';

interface NarrativeFrameProps {
  narrative: NarrativeContext;
  subject: 'geometry' | 'statistics';
}

export function NarrativeFrame({ narrative, subject }: NarrativeFrameProps) {
  const accentColor = subject === 'geometry' ? 'var(--geometry)' : 'var(--statistics)';
  const bgColor =
    subject === 'geometry' ? 'rgba(245,158,11,0.06)' : 'rgba(59,130,246,0.06)';

  return (
    <div
      className="rounded-xl border-l-4 px-4 py-3 mb-6"
      style={{ borderColor: accentColor, background: bgColor }}
    >
      {narrative.character && (
        <p className="text-xs font-semibold mb-1" style={{ color: accentColor }}>
          {narrative.character}
        </p>
      )}
      <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--text)' }}>
        {narrative.setting}
      </p>
      <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
        {narrative.problemStatement}
      </p>
      <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
        Real world: {narrative.realWorldConnection}
      </p>
    </div>
  );
}
