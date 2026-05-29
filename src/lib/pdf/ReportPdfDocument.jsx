import {
  Document,
  Image,
  Link,
  Page,
  StyleSheet,
  Text,
  View
} from "@react-pdf/renderer";
import { splitSectionsByPage } from "./buildReportSections.js";
import {
  APP_NAME,
  DEVELOPER_CREDIT_PREFIX,
  DEVELOPER_GITHUB_URL,
  DEVELOPER_NAME,
  PDF_DISCLAIMER,
  SITE_URL
} from "../siteLinks.js";

function createStyles(theme) {
  return StyleSheet.create({
    page: {
      backgroundColor: theme.pageBackground,
      color: theme.text,
      fontFamily: "Helvetica",
      fontSize: 10,
      lineHeight: 1.45,
      paddingTop: 40,
      paddingBottom: 64,
      paddingHorizontal: 40
    },
    footer: {
      position: "absolute",
      bottom: 20,
      left: 40,
      right: 40,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      paddingTop: 8,
      gap: 2
    },
    footerTitle: {
      color: theme.text,
      fontSize: 8,
      fontFamily: "Helvetica-Bold",
      marginBottom: 3
    },
    footerLine: {
      fontSize: 7.5,
      color: theme.textMuted,
      lineHeight: 1.4,
      marginBottom: 2
    },
    footerLink: {
      fontSize: 7.5,
      color: theme.textMuted,
      lineHeight: 1.4,
      textDecoration: "none"
    },
    footerDevRow: {
      flexDirection: "row",
      alignItems: "center"
    },
    block: {
      marginBottom: 14
    },
    blockBreak: {
      marginBottom: 14,
      marginTop: 4
    },
    label: {
      fontSize: 8,
      fontFamily: "Helvetica-Bold",
      textTransform: "uppercase",
      letterSpacing: 0.6,
      color: theme.textMuted,
      marginBottom: 6
    },
    title: {
      fontSize: 16,
      fontFamily: "Helvetica-Bold",
      marginBottom: 4
    },
    meta: {
      fontSize: 9,
      color: theme.textMuted,
      marginBottom: 16
    },
    body: {
      fontSize: 10,
      color: theme.text
    },
    questionImage: {
      maxWidth: "100%",
      maxHeight: 220,
      objectFit: "contain",
      marginBottom: 8
    },
    imageCaption: {
      fontSize: 8,
      color: theme.textFaint
    },
    scoresCard: {
      backgroundColor: theme.scoreCardBackground,
      color: theme.scoreCardText,
      borderRadius: 6,
      padding: 14,
      marginBottom: 10
    },
    overallRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginBottom: 10
    },
    overallLabel: {
      fontSize: 9,
      color: theme.scoreCardMuted
    },
    overallValue: {
      fontSize: 22,
      fontFamily: "Helvetica-Bold"
    },
    criteriaGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8
    },
    criteriaCell: {
      width: "48%",
      backgroundColor: theme.surface,
      borderRadius: 4,
      padding: 8,
      marginBottom: 4
    },
    criteriaBadge: {
      fontSize: 7,
      fontFamily: "Helvetica-Bold",
      color: theme.scoreCardMuted,
      marginBottom: 2
    },
    criteriaName: {
      fontSize: 8,
      color: theme.textMuted,
      marginBottom: 2
    },
    criteriaScore: {
      fontSize: 14,
      fontFamily: "Helvetica-Bold",
      color: theme.text
    },
    card: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 6,
      padding: 10,
      marginBottom: 8,
      backgroundColor: theme.surface
    },
    cardHead: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 6
    },
    cardTitle: {
      fontFamily: "Helvetica-Bold",
      fontSize: 10
    },
    cardScore: {
      fontFamily: "Helvetica-Bold",
      fontSize: 10
    },
    bullet: {
      marginLeft: 10,
      marginBottom: 3,
      fontSize: 9
    },
    diagnosticRow: {
      flexDirection: "row",
      marginBottom: 6,
      gap: 6
    },
    diagnosticStatus: {
      width: 12,
      fontFamily: "Helvetica-Bold",
      fontSize: 10
    },
    diagnosticMet: {
      color: theme.text
    },
    diagnosticUnmet: {
      color: theme.textMuted
    },
    diagnosticNote: {
      fontSize: 8,
      color: theme.textMuted,
      marginTop: 2
    },
    changeItem: {
      marginBottom: 8
    },
    changeLine: {
      fontSize: 9,
      marginBottom: 2
    },
    strikethrough: {
      textDecoration: "line-through",
      color: theme.textMuted
    },
    changeReason: {
      fontSize: 8,
      color: theme.textMuted
    }
  });
}

function PdfFooter({ styles }) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerTitle}>{APP_NAME}</Text>
      <Link src={SITE_URL} style={styles.footerLink}>
        {SITE_URL}
      </Link>
      <Text style={styles.footerLine}>{PDF_DISCLAIMER}</Text>
      <View style={styles.footerDevRow}>
        <Text style={styles.footerLine}>{DEVELOPER_CREDIT_PREFIX} </Text>
        <Link src={DEVELOPER_GITHUB_URL} style={styles.footerLink}>
          {DEVELOPER_NAME}
        </Link>
      </View>
    </View>
  );
}

function SectionWrapper({ section, styles, children }) {
  const wrapperStyle = section.sectionBreak ? styles.blockBreak : styles.block;
  return (
    <View style={wrapperStyle} break={section.sectionBreak || undefined}>
      {children}
    </View>
  );
}

function renderSection(section, styles) {
  switch (section.type) {
    case "documentTitle":
      return (
        <View key="documentTitle" style={styles.block}>
          <Text style={styles.title}>{section.title}</Text>
          <Text style={styles.meta}>{section.taskType}</Text>
        </View>
      );
    case "questionText":
      return (
        <SectionWrapper key="questionText" section={section} styles={styles}>
          <Text style={styles.label}>Question</Text>
          <Text style={styles.body}>{section.text}</Text>
        </SectionWrapper>
      );
    case "questionImage":
      return (
        <SectionWrapper key="questionImage" section={section} styles={styles}>
          <Text style={styles.label}>Question</Text>
          <Image src={section.src} style={styles.questionImage} />
          {section.name ? <Text style={styles.imageCaption}>{section.name}</Text> : null}
        </SectionWrapper>
      );
    case "essay":
      return (
        <SectionWrapper key="essay" section={section} styles={styles}>
          <Text style={styles.label}>Your answer ({section.wordCount} words)</Text>
          <Text style={styles.body}>{section.text}</Text>
        </SectionWrapper>
      );
    case "scores":
      return (
        <SectionWrapper key="scores" section={section} styles={styles}>
          <Text style={styles.label}>Band scores</Text>
          <View style={styles.scoresCard}>
            <View style={styles.overallRow}>
              <Text style={styles.overallLabel}>Overall</Text>
              <Text style={styles.overallValue}>{section.overall}</Text>
            </View>
            <View style={styles.criteriaGrid}>
              {section.criteria.map((criterion) => (
                <View key={criterion.key} style={styles.criteriaCell}>
                  <Text style={styles.criteriaBadge}>{criterion.label}</Text>
                  <Text style={styles.criteriaName}>{criterion.title}</Text>
                  <Text style={styles.criteriaScore}>{criterion.score}</Text>
                </View>
              ))}
            </View>
          </View>
        </SectionWrapper>
      );
    case "summary":
      return (
        <SectionWrapper key="summary" section={section} styles={styles}>
          <Text style={styles.label}>Summary</Text>
          <Text style={styles.body}>{section.text}</Text>
        </SectionWrapper>
      );
    case "diagnostic":
      return (
        <SectionWrapper
          key={`diagnostic-${section.title}`}
          section={section}
          styles={styles}
        >
          <Text style={styles.label}>{section.title}</Text>
          {section.items.map((item) => (
            <View key={item.id} style={styles.diagnosticRow}>
              <Text
                style={[
                  styles.diagnosticStatus,
                  item.met ? styles.diagnosticMet : styles.diagnosticUnmet
                ]}
              >
                {item.met ? "✓" : "✗"}
              </Text>
              <View>
                <Text style={styles.body}>{item.label}</Text>
                {item.note ? <Text style={styles.diagnosticNote}>{item.note}</Text> : null}
              </View>
            </View>
          ))}
        </SectionWrapper>
      );
    case "criteriaCards":
      return (
        <SectionWrapper key="criteriaCards" section={section} styles={styles}>
          <Text style={styles.label}>Criteria feedback</Text>
          {section.items.map((item) => (
            <View key={item.name} style={styles.card} wrap={false}>
              <View style={styles.cardHead}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardScore}>{item.score}</Text>
              </View>
              {item.description ? <Text style={styles.body}>{item.description}</Text> : null}
              {item.points.map((point) => (
                <Text key={point} style={styles.bullet}>
                  • {point}
                </Text>
              ))}
            </View>
          ))}
        </SectionWrapper>
      );
    case "changes":
      return (
        <SectionWrapper
          key={`changes-${section.title}`}
          section={section}
          styles={styles}
        >
          <Text style={styles.label}>{section.title}</Text>
          {section.items.map((item, itemIndex) => (
            <View key={`${section.title}-${itemIndex}`} style={styles.changeItem}>
              <Text style={styles.changeLine}>
                <Text style={styles.strikethrough}>{item.from}</Text>
                {" → "}
                {item.to}
              </Text>
              {item.reason ? <Text style={styles.changeReason}>{item.reason}</Text> : null}
            </View>
          ))}
        </SectionWrapper>
      );
    default:
      return null;
  }
}

function ReportPage({ sections, styles, pageKey }) {
  return (
    <Page size="A4" style={styles.page} wrap>
      {sections.map((section, index) => (
        <View key={`${pageKey}-${section.type}-${index}`}>
          {renderSection(section, styles)}
        </View>
      ))}
      <PdfFooter styles={styles} />
    </Page>
  );
}

export function ReportPdfDocument({ sections, theme }) {
  const styles = createStyles(theme);
  const { essaySections, analysisSections } = splitSectionsByPage(sections);

  return (
    <Document title={APP_NAME}>
      <ReportPage sections={essaySections} styles={styles} pageKey="essay" />
      {analysisSections.length > 0 ? (
        <ReportPage sections={analysisSections} styles={styles} pageKey="analysis" />
      ) : null}
    </Document>
  );
}
