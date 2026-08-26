import twilio from 'twilio';

let client;
try {
  client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
} catch (err) {
  console.warn('Twilio client initialization failed. Missing credentials? SMS fallback will not work.', err.message);
}

export const sendSms = ({ to, body }) => {
  if (!client) {
    console.error('Cannot send SMS: Twilio client not initialized.');
    return;
  }
  return client.messages.create({
    to,
    body,
    from: process.env.TWILIO_FROM_NUMBER
  });
};

export const validateTwilioSignature = (req) => {
  if (!process.env.TWILIO_AUTH_TOKEN) return false;
  return twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN,
    req.headers['x-twilio-signature'] || '',
    `${process.env.BASE_URL}/api/sms/inbound`,
    req.body
  );
};
