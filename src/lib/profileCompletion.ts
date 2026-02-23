type Profile = {
  full_name?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  avatar_url?: string | null;
  document_type?: string | null;
  document_number?: string | null;
  document_url?: string | null;
} | null;

type ProfessionalProfile = {
  title?: string | null;
  bio?: string | null;
  location?: string | null;
  years_experience?: number | null;
  availability?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  portfolio_url?: string | null;
} | null;

const PERSONAL_FIELDS = [
  "full_name",
  "phone",
  "address",
  "city",
  "avatar_url",
  "document_type",
  "document_number",
] as const;

const PROFESSIONAL_FIELDS = [
  "title",
  "bio",
  "location",
  "years_experience",
  "availability",
  "linkedin_url",
] as const;

function isFilled(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return true;
  return false;
}

export function calculateProfileCompletion(
  profile: Profile,
  professionalProfile: ProfessionalProfile
): {
  percentage: number;
  personalPct: number;
  professionalPct: number;
  missingFields: string[];
} {
  const missingFields: string[] = [];

  let personalFilled = 0;
  for (const field of PERSONAL_FIELDS) {
    const value = profile?.[field as keyof Profile];
    if (isFilled(value)) {
      personalFilled++;
    } else {
      missingFields.push(field);
    }
  }
  const personalPct = PERSONAL_FIELDS.length > 0 ? (personalFilled / PERSONAL_FIELDS.length) * 100 : 0;

  let professionalFilled = 0;
  for (const field of PROFESSIONAL_FIELDS) {
    const value = professionalProfile?.[field as keyof ProfessionalProfile];
    if (isFilled(value)) {
      professionalFilled++;
    } else {
      missingFields.push(field);
    }
  }
  const professionalPct =
    PROFESSIONAL_FIELDS.length > 0 ? (professionalFilled / PROFESSIONAL_FIELDS.length) * 100 : 0;

  const totalFields = PERSONAL_FIELDS.length + PROFESSIONAL_FIELDS.length;
  const totalFilled = personalFilled + professionalFilled;
  const percentage = totalFields > 0 ? (totalFilled / totalFields) * 100 : 0;

  return {
    percentage: Math.round(percentage),
    personalPct: Math.round(personalPct),
    professionalPct: Math.round(professionalPct),
    missingFields,
  };
}
