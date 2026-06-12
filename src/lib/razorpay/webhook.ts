// ரேஸர்பே வெப்ஹூக் (Razorpay webhook helper)
import crypto from 'crypto';

export const verifyWebhookSignature = (body: string, signature: string, secret: string) => {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body.toString())
    .digest('hex');

  return expectedSignature === signature;
};
