import { jsPDF } from "jspdf";

interface Profile {
  full_name?: string | null;
  phone?: string | null;
  city?: string | null;
  address?: string | null;
}

interface ProfessionalProfile {
  title?: string | null;
  bio?: string | null;
  location?: string | null;
  years_experience?: number | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  portfolio_url?: string | null;
}

interface Skill {
  skill_name: string;
  skill_level?: string;
}

interface Experience {
  company_name: string;
  position: string;
  start_date: string;
  end_date?: string | null;
  description?: string | null;
}

interface Education {
  institution: string;
  degree?: string | null;
  field_of_study?: string | null;
  start_date: string;
  end_date?: string | null;
}

interface CurriculumData {
  profile?: Profile | null;
  professionalProfile?: ProfessionalProfile | null;
  skills?: Skill[];
  experience?: Experience[];
  education?: Education[];
}

type PDFLang = "es" | "en";

const LABELS: Record<PDFLang, { education: string; experience: string; skills: string; summary: string; present: string; yearsExp: string; skillLevels: Record<string, string> }> = {
  es: {
    education: "Educación",
    experience: "Experiencia",
    skills: "Habilidades",
    summary: "Resumen",
    present: "Actualidad",
    yearsExp: "años de experiencia profesional.",
    skillLevels: { beginner: "Principiante", intermediate: "Intermedio", advanced: "Avanzado", expert: "Experto" },
  },
  en: {
    education: "Education",
    experience: "Experience",
    skills: "Skills",
    summary: "Summary",
    present: "Present",
    yearsExp: "years of professional experience.",
    skillLevels: { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced", expert: "Expert" },
  },
};

const MARGIN = 20;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const LINE_HEIGHT = 6;
const BOTTOM_MARGIN = 20;
const SECTION_GAP = 8;
const HEADING_SIZE = 12;
const BODY_SIZE = 10;
const TITLE_SIZE = 18;

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    const [y, m] = dateStr.split("-");
    if (y && m) return `${m}/${y}`;
    return dateStr;
  } catch {
    return dateStr;
  }
}

function formatDateRange(start: string, end: string | null | undefined, presentLabel: string): string {
  const startStr = formatDate(start);
  const endStr = end ? formatDate(end) : presentLabel;
  return `${startStr} – ${endStr}`;
}

function checkPageBreak(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_HEIGHT - BOTTOM_MARGIN) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  fontSize: number
): number {
  doc.setFontSize(fontSize);
  const lines = doc.splitTextToSize(text, maxWidth);
  const height = lines.length * (fontSize * 0.4 + 1);
  y = checkPageBreak(doc, y, height);
  doc.text(lines, x, y);
  return y + height;
}

function addSectionHeader(doc: jsPDF, title: string, y: number): number {
  y = checkPageBreak(doc, y, LINE_HEIGHT + 10);
  doc.setFontSize(HEADING_SIZE);
  doc.setFont("helvetica", "bold");
  doc.text(title.toUpperCase(), MARGIN, y);
  doc.setFont("helvetica", "normal");
  return y + LINE_HEIGHT + 2;
}

export function generateHarvardCVPDF(
  data: CurriculumData,
  email?: string | null,
  lang: PDFLang = "es"
): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const labels = LABELS[lang];
  let y = MARGIN;

  const name = data.profile?.full_name || "Curriculum Vitae";
  const title = data.professionalProfile?.title;
  const bio = data.professionalProfile?.bio;
  const location = data.professionalProfile?.location || data.profile?.city;
  const phone = data.profile?.phone;
  const yearsExp = data.professionalProfile?.years_experience;

  const contactParts: string[] = [];
  if (email) contactParts.push(email);
  if (phone) contactParts.push(phone);
  if (location) contactParts.push(location);
  if (data.professionalProfile?.linkedin_url) contactParts.push("LinkedIn");
  if (data.professionalProfile?.github_url) contactParts.push("GitHub");
  if (data.professionalProfile?.portfolio_url) contactParts.push("Portfolio");
  const contactLine = contactParts.join(" | ");

  doc.setFontSize(TITLE_SIZE);
  doc.setFont("helvetica", "bold");
  doc.text(name, PAGE_WIDTH / 2, y, { align: "center" });
  y += 10;

  if (contactLine) {
    doc.setFontSize(BODY_SIZE);
    doc.setFont("helvetica", "normal");
    doc.text(contactLine, PAGE_WIDTH / 2, y, { align: "center" });
    y += 8;
  }

  if (title) {
    doc.setFontSize(BODY_SIZE);
    doc.text(title, PAGE_WIDTH / 2, y, { align: "center" });
    y += 6;
  }

  if (bio) {
    y += SECTION_GAP;
    y = addWrappedText(doc, bio, MARGIN, y, CONTENT_WIDTH, BODY_SIZE);
    y += SECTION_GAP;
  }

  const experiences = (data.experience ?? []).sort(
    (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  );
  const educations = (data.education ?? []).sort(
    (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  );
  const skills = data.skills ?? [];

  if (educations.length > 0) {
    y = addSectionHeader(doc, labels.education, y);
    for (const ed of educations) {
      y = checkPageBreak(doc, y, LINE_HEIGHT * 3);
      const sep = lang === "es" ? " en " : " in ";
      const degreeField = [ed.degree, ed.field_of_study].filter(Boolean).join(sep);
      const line1 = degreeField
        ? `${ed.institution} – ${degreeField}`
        : ed.institution;
      const dates = formatDateRange(ed.start_date, ed.end_date, labels.present);
      doc.setFontSize(BODY_SIZE);
      doc.setFont("helvetica", "bold");
      doc.text(line1, MARGIN, y);
      y += LINE_HEIGHT;
      doc.setFont("helvetica", "normal");
      doc.text(dates, MARGIN, y);
      y += LINE_HEIGHT + 2;
    }
    y += SECTION_GAP;
  }

  if (experiences.length > 0) {
    y = addSectionHeader(doc, labels.experience, y);
    for (const exp of experiences) {
      y = checkPageBreak(doc, y, LINE_HEIGHT * 4);
      const positionLine = `${exp.position} – ${exp.company_name}`;
      const dates = formatDateRange(exp.start_date, exp.end_date, labels.present);
      doc.setFontSize(BODY_SIZE);
      doc.setFont("helvetica", "bold");
      doc.text(positionLine, MARGIN, y);
      y += LINE_HEIGHT;
      doc.setFont("helvetica", "normal");
      doc.text(dates, MARGIN, y);
      y += LINE_HEIGHT;
      if (exp.description) {
        const descLines = doc.splitTextToSize(exp.description, CONTENT_WIDTH);
        doc.text(descLines, MARGIN, y);
        y += descLines.length * (BODY_SIZE * 0.4 + 1) + 2;
      } else {
        y += 2;
      }
    }
    y += SECTION_GAP;
  }

  if (skills.length > 0) {
    y = addSectionHeader(doc, labels.skills, y);
    const skillStr = skills
      .map((s) =>
        s.skill_level ? `${s.skill_name} (${labels.skillLevels[s.skill_level] || s.skill_level})` : s.skill_name
      )
      .join(", ");
    y = addWrappedText(doc, skillStr, MARGIN, y, CONTENT_WIDTH, BODY_SIZE);
    y += SECTION_GAP;
  }

  if (yearsExp != null && experiences.length === 0) {
    y = addSectionHeader(doc, labels.summary, y);
    doc.setFontSize(BODY_SIZE);
    doc.text(`${yearsExp} ${labels.yearsExp}`, MARGIN, y);
  }

  return doc;
}

export function downloadHarvardCVPDF(
  data: CurriculumData,
  email?: string | null,
  lang: PDFLang = "es",
  filename?: string
): void {
  const doc = generateHarvardCVPDF(data, email, lang);
  const name = data.profile?.full_name || "curriculum";
  const safeName = name.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 30);
  const suffix = lang === "es" ? "CV" : "Resume";
  doc.save(filename || `${safeName}-${suffix}-Harvard.pdf`);
}
