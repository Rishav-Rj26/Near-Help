import { generateStructured } from './geminiClient.js';

export const generateCrisisGuidance = async ({ crisisType, details }) => {
  const schema = {
    type: 'object',
    properties: {
      steps: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    required: ['steps'],
  };

  const prompt = `
You are a calm, concise first-response assistant. Give 3-6 short imperative steps an untrained bystander can take in the first 60 seconds.
No diagnoses. Always include "Contact emergency services" unless crisisType is "threat", where personal safety comes first.
Crisis Type: ${crisisType}
Additional Details: ${details || 'None provided'}
`;

  const result = await generateStructured({ prompt, schema });
  if (result) {
    return result;
  }

  // Fallbacks
  const fallbacks = {
    medical: { steps: ["Check if the person is responsive and breathing", "Call emergency services (112/911)", "If trained, begin CPR if no pulse detected", "Do not move the person unless in immediate danger", "Stay with them and keep them calm until help arrives"] },
    fire: { steps: ["Alert everyone nearby to evacuate immediately", "Call fire services (112/911)", "Stay low to avoid smoke inhalation", "Do not use elevators — use stairs only", "Move to the designated assembly point"] },
    gas_leak: { steps: ["Do not operate any electrical switches or create sparks", "Open windows and doors if safe to do so", "Evacuate the area immediately", "Call emergency services (112/911) from a safe distance", "Contact the gas utility company"] },
    accident: { steps: ["Check for immediate hazards (traffic, fuel leaks)", "Call emergency services (112/911)", "Do not move injured people unless in danger", "Apply pressure to any visible bleeding with a clean cloth", "Turn on hazard lights if vehicle accident"] },
    threat: { steps: ["Move to a safe location immediately", "Lock or barricade doors if indoors", "Silence your phone", "Call police (112/911) when safely hidden", "Do not confront the threat"] },
    other: { steps: ["Assess the situation for immediate dangers", "Call emergency services (112/911)", "Move to a safe distance", "Alert others nearby of the danger", "Wait for professional responders"] },
  };

  return fallbacks[crisisType] || fallbacks.other;
};
