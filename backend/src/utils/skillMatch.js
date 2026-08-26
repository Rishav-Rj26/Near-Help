// Source of truth for skills allowed in the system
export const VALID_SKILLS = [
  'CPR',
  'First Aid',
  'Doctor',
  'Nurse',
  'Paramedic',
  'Firefighter',
  'Lifeguard',
  'Mental Health First Aid',
];

// Mapping from crisisType to relevant skills
const CRISIS_SKILL_MAP = {
  medical: ['CPR', 'First Aid', 'Doctor', 'Nurse', 'Paramedic'],
  fire: ['Firefighter', 'First Aid'],
  gas_leak: ['Firefighter', 'First Aid'],
  accident: ['CPR', 'First Aid', 'Doctor', 'Nurse', 'Paramedic', 'Firefighter'],
  threat: ['Mental Health First Aid'],
  other: [],
};

// Higher index = higher seniority for badge display
// E.g., if a user has both "CPR" and "Doctor", "Doctor" is preferred as the primary label.
const SKILL_SENIORITY = [
  'First Aid',
  'CPR',
  'Lifeguard',
  'Mental Health First Aid',
  'Firefighter',
  'Paramedic',
  'Nurse',
  'Doctor',
];

/**
 * Returns true if the user has any skill relevant to the given crisis type.
 */
export const hasRelevantSkill = (crisisType, userSkills = []) => {
  const relevantSkills = CRISIS_SKILL_MAP[crisisType] || [];
  return userSkills.some(skill => relevantSkills.includes(skill));
};

/**
 * Returns all user skills that are relevant to the crisis type.
 */
export const getMatchedSkills = (crisisType, userSkills = []) => {
  const relevantSkills = CRISIS_SKILL_MAP[crisisType] || [];
  return userSkills.filter(skill => relevantSkills.includes(skill));
};

/**
 * Returns the highest seniority skill from the matched skills, or null if no match.
 */
export const getTopMatchedSkill = (crisisType, userSkills = []) => {
  const matched = getMatchedSkills(crisisType, userSkills);
  if (matched.length === 0) return null;

  return matched.reduce((topSkill, currentSkill) => {
    const topIdx = SKILL_SENIORITY.indexOf(topSkill);
    const currIdx = SKILL_SENIORITY.indexOf(currentSkill);
    return currIdx > topIdx ? currentSkill : topSkill;
  });
};
