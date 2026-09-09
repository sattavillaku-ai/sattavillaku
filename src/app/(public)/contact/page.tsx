'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Send, CheckCircle, Clock, MessageSquare, AlertCircle } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'பொதுத் தகவல் (General Inquiry)',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="border-b-2 border-primary pb-4">
        <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
          <Mail className="w-4 h-4" />
          <span>தொடர்பு & வாசகர் கருத்துக்கள்</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-tamil text-foreground">
          தொடர்புக்கு (Contact Us)
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 font-tamil max-w-3xl leading-relaxed">
          சட்டவிளக்கு ஆசிரியர் குழுவை தொடர்பு கொள்ளவும், இதழ் சந்தா, விளம்பரம், அல்லது சட்டக் கட்டுரைகள் சமர்ப்பிக்கவும் கீழ்க்காணும் வழிகளில் அணுகலாம்.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Information Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-card border border-border rounded-lg p-6 shadow-xs space-y-5">
            <h2 className="text-xl font-bold font-tamil text-foreground border-b border-border pb-3">
              தலைமை அலுவலகம்
            </h2>

            <div className="space-y-4 text-sm font-tamil">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-foreground block">முகவரி:</strong>
                  <p className="text-muted-foreground leading-relaxed mt-0.5">
                    சட்டவிளக்கு இதழ் அலுவலகம்,<br />
                    42, உயர் நீதிமன்ற வணிக வளாகம்,<br />
                    பாரிமுனை, சென்னை - 600 104, தமிழ்நாடு.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-foreground block">மின்னஞ்சல்:</strong>
                  <p className="text-muted-foreground font-sans mt-0.5">
                    ஆசிரியர் பிரிவு: <span className="text-primary font-medium">editor@sattavilakku.com</span><br />
                    செய்தி வெளியீடுகள்: <span className="text-primary font-medium">news@sattavilakku.com</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-foreground block">தொலைபேசி:</strong>
                  <p className="text-muted-foreground font-sans mt-0.5">
                    அலுவலகம்: +91 44 2534 8890<br />
                    செய்தியாளர் பிரிவு: +91 94440 12345
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-foreground block">வேலை நேரம்:</strong>
                  <p className="text-muted-foreground mt-0.5">
                    திங்கள் முதல் வெள்ளி: காலை 9:30 - மாலை 6:00
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 font-tamil leading-relaxed">
            <strong className="font-bold block mb-1">செய்தி வெளியீடுகள் சமர்ப்பிக்க:</strong>
            வழக்கறிஞர் சங்கங்கள், சட்டப் பல்கலைக்கழகங்கள், மற்றும் அரசு அமைப்புகளின் அதிகாரப்பூர்வ செய்திக் குறிப்புகளை news@sattavilakku.com என்ற முகவரிக்கு PDF அல்லது Word கோப்பாக அனுப்பலாம்.
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-card border border-border rounded-lg p-6 sm:p-8 shadow-xs">
          <h2 className="text-xl sm:text-2xl font-bold font-tamil text-foreground mb-2">
            எங்களுக்கு செய்தி அனுப்பவும்
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-tamil mb-6">
            உங்கள் கருத்துக்கள், கட்டுரைகள், அல்லது கேள்விகளை கீழே உள்ள படிவத்தில் உள்ளிட்டு அனுப்பவும்.
          </p>

          {submitted ? (
            <div className="p-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-bold font-tamil text-foreground">
                உங்கள் செய்தி வெற்றிகரமாக பெறப்பட்டது!
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground font-tamil max-w-md mx-auto">
                எமது ஆசிரியர் குழுவினர் உங்கள் செய்தியைப் பரிசீலித்து விரைவில் மின்னஞ்சல் வழியாகப் பதிலளிப்பார்கள். சட்டவிளக்குடன் இணைந்திருப்பதற்கு நன்றி.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    subject: 'பொதுத் தகவல் (General Inquiry)',
                    message: '',
                  });
                }}
                className="mt-2 inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
              >
                மற்றுமொரு செய்தி அனுப்ப
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 font-tamil">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    உங்கள் பெயர் <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="திரு / திருமதி..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    மின்னஞ்சல் முகவரி <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="yourname@domain.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    தொலைபேசி எண் (விருப்பத்தேர்வு)
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    செய்தியின் வகை <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option>பொதுத் தகவல் (General Inquiry)</option>
                    <option>சட்டக் கட்டுரை சமர்ப்பிக்க (Submit Article)</option>
                    <option>செய்திக் குறிப்பு வழங்க (Press Release)</option>
                    <option>கருத்து அல்லது திருத்தம் (Feedback / Correction)</option>
                    <option>இதழ் சந்தா வினவல் (Subscription Query)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  செய்தி விவரம் <span className="text-destructive">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="உங்கள் செய்தியை இங்கு விரிவாக எழுதவும்..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-md bg-primary text-primary-foreground font-bold text-xs sm:text-sm hover:bg-primary/90 transition-colors shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>அனுப்பப்படுகிறது...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>செய்தியை அனுப்பவும்</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
