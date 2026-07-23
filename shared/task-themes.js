export const ANY_THEME_ID = "any";

export const ANY_THEME_LABEL = "Any theme";

export const TASK_THEMES = [
  {
    id: "art",
    label: "Art",
    subtopics: [
      "censorship",
      "creativity",
      "funding",
      "education",
      "benefits",
      "galleries",
      "heritage",
      "performance",
      "criticism"
    ]
  },
  {
    id: "business",
    label: "Business",
    subtopics: ["globalisation", "entrepreneurship", "management", "leadership"]
  },
  {
    id: "communication",
    label: "Communication",
    subtopics: [
      "technology",
      "social media",
      "long-distance",
      "face-to-face",
      "personality",
      "character"
    ]
  },
  {
    id: "crime",
    label: "Crime",
    subtopics: [
      "punishment",
      "rehabilitation",
      "prisons",
      "capital punishment",
      "juveniles",
      "policing"
    ]
  },
  {
    id: "economics",
    label: "Economics",
    subtopics: [
      "globalisation",
      "credit",
      "savings",
      "spending",
      "inequality",
      "inflation",
      "poverty",
      "trade",
      "taxes",
      "debt"
    ]
  },
  {
    id: "education",
    label: "Education",
    subtopics: [
      "technology",
      "homeschooling",
      "curriculum",
      "uniforms",
      "discipline",
      "funding",
      "teachers",
      "subjects"
    ]
  },
  {
    id: "environment",
    label: "Environment",
    subtopics: [
      "climate",
      "recycling",
      "pollution",
      "conservation",
      "biodiversity",
      "renewable energy",
      "deforestation"
    ]
  },
  {
    id: "family-children",
    label: "Family & Children",
    subtopics: [
      "discipline",
      "role models",
      "childcare",
      "education",
      "generation gap",
      "family size",
      "parenting"
    ]
  },
  {
    id: "food-diet",
    label: "Food & Diet",
    subtopics: [
      "obesity",
      "fast food",
      "health diets",
      "tradition",
      "nutrition",
      "food security",
      "organic food",
      "processed food"
    ]
  },
  {
    id: "health",
    label: "Health",
    subtopics: [
      "prevention",
      "treatment",
      "epidemics",
      "funding",
      "obesity",
      "hospitals",
      "exercise",
      "stress"
    ]
  },
  {
    id: "language",
    label: "Language",
    subtopics: [
      "culture",
      "learning",
      "disappearance",
      "bilingualism",
      "translation",
      "international communication"
    ]
  },
  {
    id: "media-advertising",
    label: "Media & Advertising",
    subtopics: [
      "censorship",
      "freedom",
      "children",
      "impact",
      "social media",
      "technology",
      "reporting"
    ]
  },
  {
    id: "reading",
    label: "Reading",
    subtopics: [
      "ebooks",
      "libraries",
      "leisure",
      "children",
      "comprehension",
      "digital reading",
      "fiction",
      "nonfiction",
      "accessibility"
    ]
  },
  {
    id: "space",
    label: "Space",
    subtopics: [
      "exploration",
      "tourism",
      "international cooperation",
      "funding",
      "research",
      "colonisation",
      "satellites"
    ]
  },
  {
    id: "technology",
    label: "Technology",
    subtopics: [
      "internet",
      "AI",
      "privacy",
      "hacking",
      "digital divide",
      "safety",
      "automation",
      "data storage",
      "social media"
    ]
  },
  {
    id: "transport",
    label: "Transport",
    subtopics: [
      "infrastructure",
      "public transport",
      "congestion",
      "safety",
      "environment",
      "innovation"
    ]
  },
  {
    id: "travel-tourism",
    label: "Travel & Tourism",
    subtopics: [
      "culture",
      "globalisation",
      "sustainability",
      "economy",
      "leisure",
      "immigration",
      "local benefits"
    ]
  },
  {
    id: "society",
    label: "Society",
    subtopics: [
      "overpopulation",
      "poverty",
      "inequality",
      "homelessness",
      "public services",
      "demographics"
    ]
  },
  {
    id: "sport-fitness",
    label: "Sport & Fitness",
    subtopics: [
      "professionalism",
      "amateurs",
      "salary",
      "equipment",
      "doping",
      "health",
      "gender",
      "sponsorship"
    ]
  },
  {
    id: "work-employment",
    label: "Work & Employment",
    subtopics: [
      "equality",
      "salaries",
      "women at work",
      "part-time work",
      "shift work",
      "technology",
      "unemployment",
      "automation"
    ]
  }
];

const THEME_IDS = new Set(TASK_THEMES.map((theme) => theme.id));

export function resolveThemeId(themeId) {
  const normalized = String(themeId || "").trim();

  if (normalized === ANY_THEME_ID) {
    return ANY_THEME_ID;
  }

  return THEME_IDS.has(normalized) ? normalized : ANY_THEME_ID;
}

export function getThemeById(themeId) {
  const resolvedId = resolveThemeId(themeId);

  if (resolvedId === ANY_THEME_ID) {
    return null;
  }

  return TASK_THEMES.find((theme) => theme.id === resolvedId) ?? null;
}

export function getThemeLabel(themeId) {
  if (resolveThemeId(themeId) === ANY_THEME_ID) {
    return ANY_THEME_LABEL;
  }

  return getThemeById(themeId)?.label ?? ANY_THEME_LABEL;
}
