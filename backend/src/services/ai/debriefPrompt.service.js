import { generateStructured } from './geminiClient.js';

export const generateDebriefQuestions = async ({ crisisType }) => {
  const schema = {
    type: 'object',
    properties: {
      questions: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    required: ['questions'],
  };

  const prompt = `
Generate 2-3 short debriefing questions for the reporter of a resolved ${crisisType} incident. Tailor the questions to the type of crisis.
`;

  const result = await generateStructured({ prompt, schema });
  if (result) {
    return result;
  }

  // Fallbacks
  const fallbacks = {
    medical: { questions: ["Did emergency medical services arrive on scene?", "Was the person conscious and responsive when help arrived?", "Is any follow-up medical care needed?"] },
    fire: { questions: ["Was the fire department able to contain the fire?", "Was everyone evacuated safely?", "Is the area safe to re-enter?"] },
    gas_leak: { questions: ["Has the gas utility company been contacted?", "Has the area been properly ventilated?", "Has the source of the leak been identified and sealed?"] },
    accident: { questions: ["Were all injured parties attended to by medical services?", "Has the accident scene been cleared or secured?", "Were police or traffic authorities notified?"] },
    threat: { questions: ["Are you now in a safe location?", "Have law enforcement been notified and responded?", "Do you need any follow-up support or safety planning?"] },
    other: { questions: ["Has the situation been fully resolved?", "Were professional emergency services needed?", "Is any follow-up action required?"] },
  };

  return fallbacks[crisisType] || fallbacks.other;
};
