import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'தனியுரிமை கொள்கை | சட்டவிளக்கு - Privacy Policy',
  description: 'சட்டவிளக்கு (Sattavilakku) இதழின் தனியுரிமைக் கொள்கை. எங்களது பயனர் தரவு பாதுகாப்பு மற்றும் பயன்பாட்டு விதிகள்.',
  alternates: {
    canonical: 'https://sattavilakku.com/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl font-serif">
      <h1 className="text-3xl font-bold mb-8">தனியுரிமை கொள்கை (Privacy Policy)</h1>
      
      <div className="space-y-6 leading-relaxed">
        <p>சட்டவிளக்கு இதழ் தனது வாசகர்களின் தனியுரிமையை மிகவும் மதிக்கிறது. இந்திய தகவல் தொழில்நுட்பச் சட்டம் 2000-ன் படி இந்தப் பாதுகாப்புக் கொள்கைகள் வகுக்கப்பட்டுள்ளன.</p>
        
        <h2 className="text-xl font-bold mt-8">நாங்கள் சேகரிக்கும் தகவல்கள்</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>உங்கள் பெயர் மற்றும் மின்னஞ்சல் முகவரி (கணக்கு உருவாக்க).</li>
          <li>பரிவர்த்தனை எண்கள் (சந்தா விவரங்களைச் சரிபார்க்க).</li>
          <li>உங்கள் வங்கி அட்டை அல்லது கடவுச்சொல் போன்ற ரகசியத் தகவல்களை நாங்கள் சேமிப்பதில்லை; Razorpay தளம் அவற்றைப் பாதுகாப்பாகக் கையாள்கிறது.</li>
        </ul>

        <h2 className="text-xl font-bold mt-8">தகவல் பயன்பாடு</h2>
        <p>உங்கள் தகவல்கள் உங்களுக்கு இதழ் தொடர்பான மின்னஞ்சல்களை அனுப்பவும், உங்கள் சந்தாவை உறுதிப்படுத்தவும் மட்டுமே பயன்படுத்தப்படும். விளம்பரங்களுக்காக உங்கள் தகவல்களை மூன்றாம் தரப்பினருக்கு விற்பனை செய்ய மாட்டோம்.</p>

        <h2 className="text-xl font-bold mt-8">தரவு நீக்கம்</h2>
        <p>உங்கள் கணக்கை நிரந்தரமாக நீக்க விரும்பினால், எங்களது மின்னஞ்சல் முகவரிக்கு (privacy@sattavilakku.com) கோரிக்கை அனுப்பலாம். 30 நாட்களுக்குள் உங்கள் தரவுகள் அனைத்தும் நீக்கப்படும்.</p>
      </div>
    </div>
  );
}
