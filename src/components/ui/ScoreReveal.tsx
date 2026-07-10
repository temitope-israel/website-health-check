'use client';

import { motion } from 'framer-motion';
import { getRating } from '@/lib/scoring';
import { AnimatedNumber } from './AnimatedNumber';
import type { AuditScores } from '@/lib/scoring';

const RATING_STYLES = {
  good: { ring: 'stroke-ok', text: 'text-ok', label: 'Good' },
  'needs-improvement': {
    ring: 'stroke-beacon',
    text: 'text-beacon',
    label: 'Needs Work',
  },
  poor: { ring: 'stroke-red-400', text: 'text-red-400', label: 'Poor' },
};

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
} as const;

function ScoreRing({ label, score }: { label: string; score: number }) {
  const rating = getRating(score);
  const style = RATING_STYLES[rating];
  const circumference = 2 * Math.PI * 34;
  const offset = circumference - (score / 100) * circumference;

  return (
    <motion.div variants={item} className="flex flex-col items-center gap-2">
      <div className="relative h-20 w-20">
        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="34"
            className="stroke-mist/15"
            strokeWidth="6"
            fill="none"
          />
          <motion.circle
            cx="40"
            cy="40"
            r="34"
            className={style.ring}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>
        <div
          className={`absolute inset-0 flex items-center justify-center font-mono text-lg font-medium ${style.text}`}
        >
          <AnimatedNumber value={score} />
        </div>
      </div>
      <p className="font-mono text-xs uppercase tracking-widest text-mist">
        {label}
      </p>
      <p className={`font-mono text-xs ${style.text}`}>{style.label}</p>
    </motion.div>
  );
}

export function ScoreReveal({ scores }: { scores: AuditScores }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4"
    >
      <ScoreRing label="Performance" score={scores.performance} />
      <ScoreRing label="SEO" score={scores.seo} />
      <ScoreRing label="Accessibility" score={scores.accessibility} />
      <ScoreRing label="Best Practices" score={scores.bestPractices} />
    </motion.div>
  );
}
