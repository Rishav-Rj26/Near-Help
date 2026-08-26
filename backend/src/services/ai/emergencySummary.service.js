import { generateStructured } from './geminiClient.js';

export const generateEmergencySummary = async ({ crisisType, location, details, radius, responderCount }) => {
  const schema = {
    type: 'object',
    properties: {
      summary: {
        type: 'string',
      },
    },
    required: ['summary'],
  };

  const prompt = `
Generate a factual 3-4 sentence summary for a 911/112 dispatcher. Include: emergency type, approximate location description, number of responders on-scene, and any relevant details.
Do not read coordinates aloud unless no other location info is available. Write it so it can be read verbatim to a dispatcher.
Crisis Type: ${crisisType}
Location: ${location.lat}, ${location.lng} (Radius: ${radius}m)
Responder Count: ${responderCount}
Additional Details: ${details || 'None provided'}
`;

  const result = await generateStructured({ prompt, schema });
  if (result) {
    return result;
  }

  // Fallback
  return {
    summary: `A ${crisisType} emergency has been reported. The incident is located at coordinates ${location.lat}, ${location.lng} within a ${radius}m radius. ${responderCount > 0 ? `${responderCount} community responder(s) are currently on scene.` : 'No community responders have arrived yet.'} ${details ? `Additional details: ${details}` : 'No additional details were provided.'}`
  };
};
