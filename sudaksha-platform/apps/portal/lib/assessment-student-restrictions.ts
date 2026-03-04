/**
 * Enhancement #2: Student Experience Level Restrictions
 * Students and fresh graduates can only be assigned Junior or Middle level assessments.
 */

import type { ProficiencyLevel } from '@sudaksha/db-core';

export const STUDENT_RESTRICTED_LEVELS: ProficiencyLevel[] = ['SENIOR', 'EXPERT'];
export const STUDENT_ALLOWED_LEVELS: ProficiencyLevel[] = ['JUNIOR', 'MIDDLE'];

export const STUDENT_LEVEL_TOOLTIP =
  'Senior and Expert levels are not available for students as they require professional work experience.';

export interface MemberForRestriction {
  id: string;
  type: string;
  hasGraduated?: boolean | null;
}

/**
 * Returns true if this member is restricted from taking SENIOR/EXPERT level assessments
 * (i.e. student or fresh graduate).
 */
export function isStudentRestricted(member: MemberForRestriction): boolean {
  if (member.type !== 'STUDENT') return false;
  if (member.hasGraduated) return false;
  return true;
}

/**
 * Returns true if the given level is not allowed for students/fresh graduates.
 */
export function isLevelRestrictedForStudents(level: ProficiencyLevel | string | null): boolean {
  if (!level) return false;
  return STUDENT_RESTRICTED_LEVELS.includes(level as ProficiencyLevel);
}

/**
 * Returns true if assigning an assessment with this targetLevel to this member would violate
 * student level restrictions.
 */
export function wouldViolateStudentRestriction(
  member: MemberForRestriction,
  targetLevel: ProficiencyLevel | string | null
): boolean {
  if (!isStudentRestricted(member)) return false;
  return isLevelRestrictedForStudents(targetLevel);
}

/**
 * Filter member IDs to those that would be ineligible for this target level (students + Senior/Expert).
 */
export function getIneligibleMemberIds(
  members: MemberForRestriction[],
  targetLevel: ProficiencyLevel | string | null
): string[] {
  if (!isLevelRestrictedForStudents(targetLevel)) return [];
  return members.filter((m) => wouldViolateStudentRestriction(m, targetLevel)).map((m) => m.id);
}
