import { getRating } from '@/lib/scoring';

const RATING_STYLES = {
  good: { color: 'text-ok', label: 'Good' },
  'needs-improvement': { color: 'text-beacon', label: 'Needs Work' },
  poor: { color: 'text-red-400', label: 'Poor' },
};

interface ScoreItemProps {
  label: string;
  score: number;
}

export function ScoreItem({ label, score }: ScoreItemProps) {
  const rating = getRating(score);
  const style = RATING_STYLES[rating];

  return (
    <div className="rounded-md border border-mist/10 bg-void/50 p-3 font-mono">
      <p className="text-xs uppercase tracking-widest text-mist">{label}</p>
      <p className={`mt-1 text-2xl font-medium ${style.color}`}>{score}</p>
      <p className={`text-xs ${style.color}`}>{style.label}</p>
    </div>
  );
}
