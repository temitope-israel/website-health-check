import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer';
import { getRating, type AuditScores, type ScoreRating } from './scoring';

const COLORS = {
  ink: '#0F172A',
  mist: '#64748B',
  rule: '#E2E8F0',
  track: '#EEF1F5',
  beacon: '#F2A93B',
  ok: '#3DD68C',
  danger: '#F87171',
};

const RATING_COLORS: Record<ScoreRating, string> = {
  good: COLORS.ok,
  'needs-improvement': COLORS.beacon,
  poor: COLORS.danger,
};

function getGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
    padding: 48,
  },

  header: { position: 'relative', paddingRight: 90 },
  eyebrow: { fontSize: 9, color: COLORS.mist, letterSpacing: 2 },
  title: {
    fontSize: 26,
    color: COLORS.ink,
    fontFamily: 'Helvetica-Bold',
    marginTop: 6,
  },
  url: { fontSize: 11, color: COLORS.mist, marginTop: 4 },
  rule: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.ink,
    marginTop: 18,
    marginBottom: 28,
  },

  gradeStamp: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 74,
    height: 74,
    borderWidth: 3,
    borderStyle: 'solid',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeLetter: { fontSize: 34, fontFamily: 'Helvetica-Bold' },
  gradeCaption: { fontSize: 7, letterSpacing: 1, marginTop: 2 },

  section: { marginBottom: 26 },
  sectionLabel: {
    fontSize: 9,
    color: COLORS.mist,
    letterSpacing: 2,
    marginBottom: 14,
  },

  barRow: { marginBottom: 16 },
  barTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  barLabel: { fontSize: 11, color: COLORS.ink, fontFamily: 'Helvetica-Bold' },
  barScore: { fontSize: 11, color: COLORS.ink },
  barTrack: {
    height: 8,
    backgroundColor: COLORS.track,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 4 },

  summary: {
    borderLeftWidth: 4,
    borderLeftStyle: 'solid',
    paddingLeft: 18,
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 9,
    color: COLORS.mist,
    letterSpacing: 2,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 13,
    color: COLORS.ink,
    lineHeight: 1.6,
    fontStyle: 'italic',
  },

  footer: {
    marginTop: 40,
    borderTopWidth: 1,
    borderTopColor: COLORS.rule,
    borderTopStyle: 'solid',
    paddingTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: { fontSize: 8, color: COLORS.mist },
  footerCta: { fontSize: 8, color: COLORS.ink, fontFamily: 'Helvetica-Bold' },
});

function ScoreBar({ label, score }: { label: string; score: number }) {
  const rating = getRating(score);
  const color = RATING_COLORS[rating];

  return (
    <View style={styles.barRow}>
      <View style={styles.barTopLine}>
        <Text style={styles.barLabel}>{label.toUpperCase()}</Text>
        <Text style={styles.barScore}>
          {score}/100 · {getGrade(score)}
        </Text>
      </View>
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            { width: `${score}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

function getOverallSummary(scores: AuditScores) {
  const entries: [string, number][] = [
    ['Performance', scores.performance],
    ['SEO', scores.seo],
    ['Accessibility', scores.accessibility],
    ['Best Practices', scores.bestPractices],
  ];
  const weakest = entries.reduce((worst, current) =>
    current[1] < worst[1] ? current : worst
  );
  const rating = getRating(weakest[1]);

  if (rating === 'good') {
    return 'Every category scores in the "Good" range — a strong technical foundation. Whether you need performance optimizations, modern visual upgrades, or a complete website redesign, the team at Hotis Studio is ready to help.';
  }
  if (rating === 'needs-improvement') {
    return `${weakest[0]} is the weakest area at ${weakest[1]}/100. Improving it is the fastest way to raise this site's overall health. Whether you need performance optimizations, modern visual upgrades, or a complete website redesign, the team at Hotis Studio is ready to help.`;
  }
  return `${weakest[0]} is scoring poorly at ${weakest[1]}/100 — this is very likely costing real visitors and customers. Whether you need performance optimizations, modern visual upgrades, or a complete website redesign, the team at Hotis Studio is ready to help.`;
}

interface ReportDocumentProps {
  url: string;
  scores: AuditScores;
}

function ReportDocument({ url, scores }: ReportDocumentProps) {
  const generatedOn = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const overall = Math.round(
    (scores.performance +
      scores.seo +
      scores.accessibility +
      scores.bestPractices) /
      4
  );
  const overallColor = RATING_COLORS[getRating(overall)];
  const overallGrade = getGrade(overall);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';

  const categories: [string, number][] = [
    ['Performance', scores.performance],
    ['SEO', scores.seo],
    ['Accessibility', scores.accessibility],
    ['Best Practices', scores.bestPractices],
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>HOTIS STUDIO — SITE DIAGNOSTIC</Text>
          <Text style={styles.title}>Website Health Check</Text>
          <Text style={styles.url}>{url}</Text>

          <View style={[styles.gradeStamp, { borderColor: overallColor }]}>
            <Text style={[styles.gradeLetter, { color: overallColor }]}>
              {overallGrade}
            </Text>
            <Text style={[styles.gradeCaption, { color: overallColor }]}>
              OVERALL
            </Text>
          </View>

          <View style={styles.rule} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SCORE BREAKDOWN</Text>
          {categories.map(([label, score]) => (
            <ScoreBar key={label} label={label} score={score} />
          ))}
        </View>

        <View style={[styles.summary, { borderLeftColor: overallColor }]}>
          <Text style={styles.summaryLabel}>WHAT THIS MEANS</Text>
          <Text style={styles.summaryText}>{getOverallSummary(scores)}</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated by Hotis Studio on {generatedOn}
          </Text>
          {siteUrl && (
            <Text style={styles.footerCta}>
              Scan another site free at {siteUrl}
            </Text>
          )}
        </View>
      </Page>
    </Document>
  );
}

export async function generateReportPdf(
  url: string,
  scores: AuditScores
): Promise<Buffer> {
  return renderToBuffer(<ReportDocument url={url} scores={scores} />);
}

// import type { ComponentProps } from 'react';
// import {
//   Document,
//   Page,
//   Text,
//   View,
//   Svg,
//   Circle,
//   StyleSheet,
//   renderToBuffer,
// } from '@react-pdf/renderer';
// import { getRating, type AuditScores, type ScoreRating } from './scoring';

// const COLORS = {
//   void: '#0A0E14',
//   ink: '#0F172A',
//   mist: '#8FA3B8',
//   paper: '#EDEFF2',
//   panel: '#F4F6F9',
//   beacon: '#F2A93B',
//   ok: '#3DD68C',
//   danger: '#F87171',
// };

// const RATING_COLORS: Record<ScoreRating, string> = {
//   good: COLORS.ok,
//   'needs-improvement': COLORS.beacon,
//   poor: COLORS.danger,
// };

// const RATING_LABELS: Record<ScoreRating, string> = {
//   good: 'GOOD',
//   'needs-improvement': 'NEEDS WORK',
//   poor: 'POOR',
// };

// const styles = StyleSheet.create({
//   page: { fontFamily: 'Helvetica', backgroundColor: '#FFFFFF' },

//   header: { backgroundColor: COLORS.void, padding: 36, alignItems: 'center' },
//   eyebrow: {
//     fontSize: 9,
//     color: COLORS.beacon,
//     letterSpacing: 2,
//     marginBottom: 6,
//   },
//   title: { fontSize: 18, color: COLORS.paper, fontFamily: 'Helvetica-Bold' },
//   url: { fontSize: 10, color: COLORS.mist, marginTop: 4 },
//   overallLabel: {
//     fontSize: 9,
//     color: COLORS.mist,
//     letterSpacing: 1,
//     marginTop: 18,
//   },
//   overallRatingText: {
//     fontSize: 11,
//     fontFamily: 'Helvetica-Bold',
//     marginTop: 6,
//   },

//   content: { padding: 32 },

//   grid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
//   card: {
//     width: '48%',
//     backgroundColor: COLORS.panel,
//     borderRadius: 8,
//     borderTopWidth: 4,
//     borderTopStyle: 'solid',
//     alignItems: 'center',
//     paddingVertical: 18,
//     paddingHorizontal: 10,
//     marginBottom: 16,
//   },
//   gaugeLabel: {
//     fontSize: 9,
//     color: COLORS.mist,
//     letterSpacing: 1,
//     marginTop: 10,
//   },
//   scoreText: { fontSize: 9, color: COLORS.ink, marginTop: 2 },

//   badge: {
//     marginTop: 8,
//     paddingHorizontal: 10,
//     paddingVertical: 3,
//     borderRadius: 999,
//     borderWidth: 1,
//     borderStyle: 'solid',
//   },
//   badgeText: { fontSize: 8, fontFamily: 'Helvetica-Bold', letterSpacing: 0.5 },

//   summaryBox: {
//     backgroundColor: COLORS.void,
//     borderRadius: 4,
//     padding: 16,
//     marginTop: 8,
//   },
//   summaryLabel: {
//     fontSize: 9,
//     color: COLORS.beacon,
//     letterSpacing: 1,
//     marginBottom: 6,
//   },
//   summaryText: { fontSize: 11, color: COLORS.paper, lineHeight: 1.5 },

//   footer: {
//     marginTop: 28,
//     borderTopWidth: 2,
//     borderTopColor: COLORS.beacon,
//     borderTopStyle: 'solid',
//     paddingTop: 12,
//     alignItems: 'center',
//   },
//   footerText: { fontSize: 8, color: COLORS.mist },
//   footerCta: {
//     fontSize: 9,
//     color: COLORS.beacon,
//     marginTop: 4,
//     fontFamily: 'Helvetica-Bold',
//   },
// });

// function Gauge({
//   score,
//   size = 64,
//   stroke = 6,
//   color,
// }: {
//   score: number;
//   size?: number;
//   stroke?: number;
//   color: string;
// }) {
//   const r = (size - stroke) / 2;
//   const cx = size / 2;
//   const cy = size / 2;
//   const circumference = 2 * Math.PI * r;
//   const offset = circumference - (score / 100) * circumference;

//   // @react-pdf/renderer's TypeScript types don't include strokeDashoffset,
//   // even though the library fully supports it at runtime. We build the exact
//   // props object we need and assert its type explicitly, rather than reaching
//   // for a broad `any` (which our own ESLint rules would flag anyway).
//   const progressCircleProps = {
//     cx: String(cx),
//     cy: String(cy),
//     r: String(r),
//     stroke: color,
//     strokeWidth: String(stroke),
//     fill: 'none',
//     strokeDasharray: `${circumference} ${circumference}`,
//     strokeDashoffset: String(offset),
//     strokeLinecap: 'round',
//     transform: `rotate(-90 ${cx} ${cy})`,
//   } as ComponentProps<typeof Circle>;

//   return (
//     <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
//       <Circle
//         cx={String(cx)}
//         cy={String(cy)}
//         r={String(r)}
//         stroke="#E5E9EF"
//         strokeWidth={String(stroke)}
//         fill="none"
//       />
//       <Circle {...progressCircleProps} />
//     </Svg>
//   );
// }

// function RatingBadge({ rating }: { rating: ScoreRating }) {
//   const color = RATING_COLORS[rating];
//   return (
//     <View
//       style={[
//         styles.badge,
//         { backgroundColor: `${color}1A`, borderColor: color },
//       ]}
//     >
//       <Text style={[styles.badgeText, { color }]}>{RATING_LABELS[rating]}</Text>
//     </View>
//   );
// }

// function getOverallSummary(scores: AuditScores) {
//   const entries: [string, number][] = [
//     ['Performance', scores.performance],
//     ['SEO', scores.seo],
//     ['Accessibility', scores.accessibility],
//     ['Best Practices', scores.bestPractices],
//   ];
//   const weakest = entries.reduce((worst, current) =>
//     current[1] < worst[1] ? current : worst
//   );
//   const rating = getRating(weakest[1]);

//   if (rating === 'good') {
//     return 'Every category scores in the "Good" range — a strong technical foundation.';
//   }
//   if (rating === 'needs-improvement') {
//     return `${weakest[0]} is the weakest area at ${weakest[1]}/100. Improving it is the fastest way to raise this site's overall health.`;
//   }
//   return `${weakest[0]} is scoring poorly at ${weakest[1]}/100 — this is very likely costing real visitors and customers.`;
// }

// interface ReportDocumentProps {
//   url: string;
//   scores: AuditScores;
// }

// function ReportDocument({ url, scores }: ReportDocumentProps) {
//   const generatedOn = new Date().toLocaleDateString('en-US', {
//     year: 'numeric',
//     month: 'long',
//     day: 'numeric',
//   });

//   const overall = Math.round(
//     (scores.performance +
//       scores.seo +
//       scores.accessibility +
//       scores.bestPractices) /
//       4
//   );
//   const overallRating = getRating(overall);
//   const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';

//   const categories: [string, number][] = [
//     ['Performance', scores.performance],
//     ['SEO', scores.seo],
//     ['Accessibility', scores.accessibility],
//     ['Best Practices', scores.bestPractices],
//   ];

//   return (
//     <Document>
//       <Page size="A4" style={styles.page}>
//         <View style={styles.header}>
//           <Text style={styles.eyebrow}>HOTIS STUDIO — SITE DIAGNOSTIC</Text>
//           <Text style={styles.title}>Website Health Check Report</Text>
//           <Text style={styles.url}>{url}</Text>

//           <Text style={styles.overallLabel}>OVERALL SCORE</Text>
//           <View style={{ marginTop: 8 }}>
//             <Gauge
//               score={overall}
//               size={90}
//               stroke={8}
//               color={RATING_COLORS[overallRating]}
//             />
//           </View>
//           <Text
//             style={[
//               styles.overallRatingText,
//               { color: RATING_COLORS[overallRating] },
//             ]}
//           >
//             {RATING_LABELS[overallRating]}
//           </Text>
//         </View>

//         <View style={styles.content}>
//           <View style={styles.grid}>
//             {categories.map(([label, score]) => {
//               const rating = getRating(score);
//               const color = RATING_COLORS[rating];
//               return (
//                 <View
//                   key={label}
//                   style={[styles.card, { borderTopColor: color }]}
//                 >
//                   <Gauge score={score} color={color} />
//                   <Text style={styles.gaugeLabel}>{label.toUpperCase()}</Text>
//                   <Text style={styles.scoreText}>{score}/100</Text>
//                   <RatingBadge rating={rating} />
//                 </View>
//               );
//             })}
//           </View>

//           <View style={styles.summaryBox}>
//             <Text style={styles.summaryLabel}>WHAT THIS MEANS</Text>
//             <Text style={styles.summaryText}>{getOverallSummary(scores)}</Text>
//           </View>

//           <View style={styles.footer}>
//             <Text style={styles.footerText}>
//               Generated by Hotis Studio on {generatedOn}
//             </Text>
//             {siteUrl && (
//               <Text style={styles.footerCta}>
//                 Scan another site free at {siteUrl}
//               </Text>
//             )}
//           </View>
//         </View>
//       </Page>
//     </Document>
//   );
// }

// export async function generateReportPdf(
//   url: string,
//   scores: AuditScores
// ): Promise<Buffer> {
//   return renderToBuffer(<ReportDocument url={url} scores={scores} />);
// }
