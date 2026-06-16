// ரேஸர்பே கிளையண்ட் (Razorpay client)
import Razorpay from 'razorpay';

export const razorpayClient = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'placeholder_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_key_secret',
});
