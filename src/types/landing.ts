export interface UseCase {
  title: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FormContent {
  nameLabel: string;
  interestLabel: string;
  interests: [string, string];
  interestNote: string;
  demoNote: string;
  contacts: Record<"telegram" | "email" | "phone", { label: string; placeholder: string }>;
  contactNote: string;
  topicLabel: string;
  topicPlaceholder: string;
  consent: string;
  submit: string;
  success: string;
  noContactError: string;
  noInterestError: string;
  submitError: string;
  alternativeContact: string;
  todo: string;
}

export interface Sections {
  hero: { title: string; paragraphs: string[]; actions: { trial: string; demo: string }; projects: UseCase[] };
  useCases: { title: string; items: UseCase[] };
  editorialFiltering: { title: string; paragraphs: string[]; mediaTodo: string };
  workflow: { title: string; steps: UseCase[] };
  foreignSources: { title: string; paragraphs: string[]; subtitle: string; example: string; result: string; mediaTodo: string };
  publishing: { title: string; paragraphs: string[]; subtitle: string; example: string; closing: string; future: string };
  trial: { title: string; description: string; intro: string; benefits: string[]; subtitle: string; help: string; action: string; note: string; formNote: string };
  faq: { title: string; items: FaqItem[] };
  contact: { title: string; description: string; accent: string; form: FormContent };
  footer: { title: string; description: string; links: string[]; privacyPath: string; copyright: string; todo: string };
}

export const sectionOrder = ["hero", "useCases", "editorialFiltering", "workflow", "foreignSources", "publishing", "trial", "faq", "contact", "footer"] as const;
export type SectionId = (typeof sectionOrder)[number];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const hasStrings = (value: unknown, fields: string[]): boolean =>
  isRecord(value) && fields.every((field) => typeof value[field] === "string");
const strings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");
const items = (value: unknown, first: string, second: string): boolean =>
  Array.isArray(value) && value.every((item) => hasStrings(item, [first, second]));

function validSection(section: Record<string, unknown>): boolean {
  switch (section.id) {
    case "hero": return hasStrings(section, ["title"]) && strings(section.paragraphs) && hasStrings(section.actions, ["trial", "demo"]) && items(section.projects, "title", "description") && (section.projects as unknown[]).length === 4;
    case "useCases": return hasStrings(section, ["title"]) && items(section.items, "title", "description") && (section.items as unknown[]).length === 6;
    case "editorialFiltering": return hasStrings(section, ["title", "mediaTodo"]) && strings(section.paragraphs);
    case "workflow": return hasStrings(section, ["title"]) && items(section.steps, "title", "description") && (section.steps as unknown[]).length === 4;
    case "foreignSources": return hasStrings(section, ["title", "subtitle", "example", "result", "mediaTodo"]) && strings(section.paragraphs);
    case "publishing": return hasStrings(section, ["title", "subtitle", "example", "closing", "future"]) && strings(section.paragraphs);
    case "trial": return hasStrings(section, ["title", "description", "intro", "subtitle", "help", "action", "note", "formNote"]) && strings(section.benefits);
    case "faq": return hasStrings(section, ["title"]) && items(section.items, "question", "answer") && (section.items as unknown[]).length === 9;
    case "contact": {
      if (!hasStrings(section, ["title", "description", "accent"]) || !isRecord(section.form)) return false;
      const form = section.form;
      return hasStrings(form, ["nameLabel", "interestLabel", "interestNote", "demoNote", "contactNote", "topicLabel", "topicPlaceholder", "consent", "submit", "success", "noContactError", "noInterestError", "submitError", "alternativeContact", "todo"])
        && strings(form.interests) && form.interests.length === 2 && isRecord(form.contacts)
        && ["telegram", "email", "phone"].every((key) => hasStrings((form.contacts as Record<string, unknown>)[key], ["label", "placeholder"]));
    }
    case "footer": return hasStrings(section, ["title", "description", "privacyPath", "copyright", "todo"]) && strings(section.links);
    default: return false;
  }
}

export function readLandingContent(value: unknown): Sections {
  if (!isRecord(value) || !Array.isArray(value.sections) || value.sections.length !== sectionOrder.length) {
    throw new Error("Некорректная структура src/content/landing.json");
  }
  const sections = {} as Sections;
  value.sections.forEach((raw: unknown, index: number) => {
    if (!isRecord(raw) || raw.id !== sectionOrder[index] || !validSection(raw)) {
      throw new Error(`Ошибка данных в разделе ${sectionOrder[index]} файла src/content/landing.json`);
    }
    (sections as unknown as Record<SectionId, unknown>)[raw.id as SectionId] = raw;
  });
  return sections;
}
