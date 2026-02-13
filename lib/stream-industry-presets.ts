/**
 * Stream & Industry presets for Institution Module (Phase 3).
 * Used for employability-focused curriculum and assessment templates.
 */

export interface StreamPreset {
  id: string;
  name: string;
  code: string;
  description?: string;
  /** Suggested industry tags for employability */
  industries: string[];
}

export interface IndustryPreset {
  id: string;
  name: string;
  code: string;
  description?: string;
}

/** Default academic streams (Program-level presets for institutions) */
export const STREAM_PRESETS: StreamPreset[] = [
  { id: "eng", name: "Engineering", code: "ENG", description: "Engineering and Technology", industries: ["IT", "Manufacturing", "Infrastructure", "Automotive"] },
  { id: "med", name: "Medicine", code: "MED", description: "Medical and Health Sciences", industries: ["Healthcare", "Pharma", "Biotech"] },
  { id: "comm", name: "Commerce", code: "COMM", description: "Commerce and Business Studies", industries: ["Finance", "Banking", "Consulting", "Retail"] },
  { id: "arts", name: "Arts & Humanities", code: "ARTS", description: "Arts, Humanities and Social Sciences", industries: ["Media", "Education", "Government", "NGO"] },
  { id: "sci", name: "Science", code: "SCI", description: "Pure and Applied Sciences", industries: ["Research", "IT", "Pharma", "Data Science"] },
  { id: "law", name: "Law", code: "LAW", description: "Legal Studies", industries: ["Legal", "Corporate", "Government"] },
  { id: "mgmt", name: "Management", code: "MGMT", description: "Business Administration and Management", industries: ["Consulting", "Finance", "Operations", "HR"] },
];

/** Industry tags for employability and assessment targeting */
export const INDUSTRY_PRESETS: IndustryPreset[] = [
  { id: "it", name: "Information Technology", code: "IT" },
  { id: "healthcare", name: "Healthcare", code: "HEALTHCARE" },
  { id: "finance", name: "Finance & Banking", code: "FINANCE" },
  { id: "manufacturing", name: "Manufacturing", code: "MANUFACTURING" },
  { id: "retail", name: "Retail & E-commerce", code: "RETAIL" },
  { id: "consulting", name: "Consulting", code: "CONSULTING" },
  { id: "education", name: "Education", code: "EDUCATION" },
  { id: "government", name: "Government & PSU", code: "GOVT" },
  { id: "pharma", name: "Pharmaceuticals", code: "PHARMA" },
  { id: "media", name: "Media & Entertainment", code: "MEDIA" },
];

export function getStreamPresetById(id: string): StreamPreset | undefined {
  return STREAM_PRESETS.find((s) => s.id === id);
}

export function getIndustryPresetByCode(code: string): IndustryPreset | undefined {
  return INDUSTRY_PRESETS.find((i) => i.code === code);
}
