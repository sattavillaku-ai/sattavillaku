'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle, Shield, Globe, Share2, Info, Lock } from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { SiteSettings } from '@/types';
import { ThemeToggle } from '@/components/theme-toggle';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(dataService.getSettings());
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setSettings(dataService.getSettings());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dataService.saveSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-5xl mx-auto font-tamil">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            தள அமைப்புகள் (Site & Editorial Settings)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            சட்டவிளக்கு இதழின் பதிப்பு விவரங்கள், சமூக ஊடக இணைப்புகள் மற்றும் ஆசிரியர் வழிகாட்டுதல்கள்
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              அமைப்புகள் சேமிக்கப்பட்டன!
            </span>
          )}

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs sm:text-sm font-bold hover:bg-primary/90 transition-colors shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>அமைப்புகளைச் சேமி (Save Settings)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Publication Details */}
        <div className="bg-card border border-border rounded-lg p-5 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-foreground border-b border-border pb-2 flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            <span>பதிப்பக & இதழ் விவரங்கள்</span>
          </h2>

          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-foreground">இதழின் தமிழ் பெயர்</label>
            <input
              type="text"
              value={settings.siteNameTamil}
              onChange={(e) => setSettings({ ...settings, siteNameTamil: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
            />
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-foreground">ஆங்கிலப் பெயர்</label>
            <input
              type="text"
              value={settings.siteNameEnglish}
              onChange={(e) => setSettings({ ...settings, siteNameEnglish: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground font-sans"
            />
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-foreground">RNI பதிவு எண் (RNI Number)</label>
            <input
              type="text"
              value={settings.rniNumber}
              onChange={(e) => setSettings({ ...settings, rniNumber: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground font-mono"
            />
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-foreground">முதன்மை ஆசிரியர் பெயர்</label>
            <input
              type="text"
              value={settings.editorInChief}
              onChange={(e) => setSettings({ ...settings, editorInChief: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
            />
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-foreground">அலுவலக முகவரி</label>
            <textarea
              rows={3}
              value={settings.officeAddress}
              onChange={(e) => setSettings({ ...settings, officeAddress: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground resize-y"
            />
          </div>
        </div>

        {/* Section 2: Contact & Social Handles */}
        <div className="bg-card border border-border rounded-lg p-5 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-foreground border-b border-border pb-2 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-primary" />
            <span>தொடர்பு & சமூக ஊடகங்கள்</span>
          </h2>

          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-foreground">ஆசிரியர் பிரிவு மின்னஞ்சல்</label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground font-sans"
            />
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-foreground">அலுவலக தொலைபேசி</label>
            <input
              type="text"
              value={settings.contactPhone}
              onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground font-sans"
            />
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-foreground">WhatsApp குழு இணைப்பு</label>
            <input
              type="url"
              value={settings.socialLinks.whatsapp || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  socialLinks: { ...settings.socialLinks, whatsapp: e.target.value },
                })
              }
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground font-sans"
            />
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-foreground">Twitter / X முகவரி</label>
            <input
              type="url"
              value={settings.socialLinks.twitter || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  socialLinks: { ...settings.socialLinks, twitter: e.target.value },
                })
              }
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground font-sans"
            />
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-foreground">Telegram சேனல்</label>
            <input
              type="url"
              value={settings.socialLinks.telegram || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  socialLinks: { ...settings.socialLinks, telegram: e.target.value },
                })
              }
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground font-sans"
            />
          </div>
        </div>

        {/* Section 3: Security & Editorial Architecture */}
        <div className="md:col-span-2 bg-card border border-border rounded-lg p-5 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-foreground border-b border-border pb-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>பாதுகாப்பு & கட்டமைப்பு அமைப்புகள் (Security Architecture)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-md bg-muted/40 border border-border space-y-1">
              <strong className="text-foreground block">Supabase Backend:</strong>
              <p className="text-muted-foreground">தரவுத்தளம் மற்றும் ஆசிரியர் உள்நுழைவு அங்கீகாரம் நேரடியாக இணைக்கப்படத் தயாராக உள்ளது.</p>
              <span className="text-emerald-600 font-bold block pt-1">RLS பாதுகாப்பு தயார்</span>
            </div>

            <div className="p-3 rounded-md bg-muted/40 border border-border space-y-1">
              <strong className="text-foreground block">Cloudinary Media:</strong>
              <p className="text-muted-foreground">அட்டைப்படங்கள் மற்றும் உயர் தெளிவுத்திறன் கொண்ட புகைப்படங்கள் ஆட்டோ-ஆப்டிமைஸ் செய்யப்படும்.</p>
              <span className="text-emerald-600 font-bold block pt-1">CDN உகப்பாக்கம் தயார்</span>
            </div>

            <div className="p-3 rounded-md bg-muted/40 border border-border space-y-1">
              <strong className="text-foreground block">Gemini AI Pipeline:</strong>
              <p className="text-muted-foreground">செய்தி மொழிபெயர்ப்புகள் சர்வர் பக்கத்தில் மட்டுமே செயலாக்கப்படும். API கீ உலாவியில் வெளிப்படாது.</p>
              <span className="text-emerald-600 font-bold block pt-1">சர்வர் பக்க API மட்டுமே</span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
