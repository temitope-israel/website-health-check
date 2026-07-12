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
  void: '#0A0E14',
  ink: '#0F172A',
  mist: '#8FA3B8',
  paper: '#EDEFF2',
  panel: '#F4F6F9',
  beacon: '#F2A93B',
  ok: '#3DD68C',
  danger: '#F87171',
};

const RATING_COLORS: Record<ScoreRating, string> = {
  good: COLORS.ok,
  'needs-improvement': COLORS.beacon,
  poor: COLORS.danger,
};

const RATING_LABELS: Record<ScoreRating, string> = {
  good: 'Good',
  'needs-improvement': 'Needs Work',
  poor: 'Poor',
};

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', backgroundColor: '#FFFFFF' },

  header: { backgroundColor: COLORS.void, padding: 32 },
  eyebrow: {
    fontSize: 9,
    color: COLORS.beacon,
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: { fontSize: 20, color: COLORS.paper, fontFamily: 'Helvetica-Bold' },
  url: { fontSize: 11, color: COLORS.mist, marginTop: 4 },

  content: { padding: 32 },
  intro: { fontSize: 11, color: COLORS.ink, marginBottom: 20 },

  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  card: {
    width: '48%',
    flexDirection: 'row',
    backgroundColor: COLORS.panel,
    borderRadius: 4,
    marginBottom: 12,
    marginRight: '4%',
    overflow: 'hidden',
  },
  cardBar: { width: 5 },
  cardBody: { padding: 12, flex: 1 },
  cardLabel: {
    fontSize: 9,
    color: COLORS.mist,
    letterSpacing: 1,
    marginBottom: 6,
  },
  cardScore: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: COLORS.ink },
  cardRating: { fontSize: 9, fontFamily: 'Helvetica-Bold', marginTop: 2 },

  summaryBox: {
    backgroundColor: COLORS.void,
    borderRadius: 4,
    padding: 16,
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 9,
    color: COLORS.beacon,
    letterSpacing: 1,
    marginBottom: 6,
  },
  summaryText: { fontSize: 11, color: COLORS.paper, lineHeight: 1.5 },

  footer: {
    marginTop: 32,
    borderTop: `2px solid ${COLORS.beacon}`,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: { fontSize: 8, color: COLORS.mist },
});

interface ReportDocumentProps {
  url: string;
  scores: AuditScores;
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
    return 'Every category scores in the "Good" range — a strong technical foundation. Keep an eye on it as the site grows.';
  }
  if (rating === 'needs-improvement') {
    return `${weakest[0]} is the weakest area at ${weakest[1]}/100. Improving it is the fastest way to raise this site's overall health — and likely its conversions.`;
  }
  return `${weakest[0]} is scoring poorly at ${weakest[1]}/100. This is very likely costing real visitors and customers — worth fixing soon.`;
}

function ScoreCard({ label, score }: { label: string; score: number }) {
  const rating = getRating(score);
  const color = RATING_COLORS[rating];

  return (
    <View style={styles.card}>
      <View style={[styles.cardBar, { backgroundColor: color }]} />
      <View style={styles.cardBody}>
        <Text style={styles.cardLabel}>{label.toUpperCase()}</Text>
        <Text style={styles.cardScore}>{score}</Text>
        <Text style={[styles.cardRating, { color }]}>
          {RATING_LABELS[rating]}
        </Text>
      </View>
    </View>
  );
}

function ReportDocument({ url, scores }: ReportDocumentProps) {
  const generatedOn = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>HOTIS STUDIO — SITE DIAGNOSTIC</Text>
          <Text style={styles.title}>Website Health Check Report</Text>
          <Text style={styles.url}>{url}</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.intro}>
            Here&rsquo;s how this site scored across four key areas that affect
            user experience, search visibility, and conversions.
          </Text>

          <View style={styles.grid}>
            <ScoreCard label="Performance" score={scores.performance} />
            <ScoreCard label="SEO" score={scores.seo} />
            <ScoreCard label="Accessibility" score={scores.accessibility} />
            <ScoreCard label="Best Practices" score={scores.bestPractices} />
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>WHAT THIS MEANS</Text>
            <Text style={styles.summaryText}>{getOverallSummary(scores)}</Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Generated by Hotis Studio on {generatedOn}
            </Text>
            <Text style={styles.footerText}>Website Health Check</Text>
          </View>
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

// import {
//   Document,
//   Page,
//   Text,
//   View,
//   StyleSheet,
//   renderToBuffer,
// } from '@react-pdf/renderer';
// import { getRating, type AuditScores } from './scoring';

// const styles = StyleSheet.create({
//   page: { padding: 40, fontFamily: 'Helvetica' },
//   heading: { fontSize: 20, marginBottom: 4 },
//   subheading: { fontSize: 11, color: '#666666', marginBottom: 24 },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingVertical: 8,
//     borderBottom: '1px solid #eeeeee',
//   },
//   label: {
//     fontSize: 12,
//   },
//   score: { fontSize: 12, fontFamily: 'Helvetica-Bold' },
//   footer: { fontSize: 9, color: '#999999', marginTop: 32 },
// });

// interface ReportDocumentProps {
//   url: string;
//   scores: AuditScores;
// }

// function ReportDocument({ url, scores }: ReportDocumentProps) {
//   const rows: [string, number][] = [
//     ['Performance', scores.performance],
//     ['SEO', scores.seo],
//     ['Accessibility', scores.accessibility],
//     ['Best Practices', scores.bestPractices],
//   ];

//   return (
//     <Document>
//       <Page size="A4" style={styles.page}>
//         <Text style={styles.heading}>
//           Hotis Studio - Website Health Check Report
//         </Text>
//         <Text style={styles.subheading}>{url}</Text>

//         {rows.map(([label, score]) => (
//           <View key={label} style={styles.row}>
//             <Text style={styles.label}>{label}</Text>
//             <Text style={styles.score}>
//               {score}/100 - {getRating(score).replace('-', ' ')}
//             </Text>
//           </View>
//         ))}

//         <Text style={styles.footer}>
//           Generated by Hotis Studio - Website Health Check
//         </Text>
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
