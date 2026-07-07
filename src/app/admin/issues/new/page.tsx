'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Loader2, Upload, ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function NewIssuePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [pdfPath, setPdfPath] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const [isPdfUploading, setIsPdfUploading] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      slug: '',
      volume_number: 1,
      issue_number: 1,
      description: '',
      status: 'draft',
      is_free: false,
    }
  });

  // தானாக Slug உருவாக்குதல் (Auto-generate slug)
  const volume = watch('volume_number');
  const issue = watch('issue_number');
  
  const handleVolumeIssueChange = () => {
     setValue('slug', `vol-${volume}-issue-${issue}`);
  };

  const supabase = createClient();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('magazine-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('magazine-assets')
        .getPublicUrl(filePath);

      setCoverImage(publicUrl);
    } catch (error: any) {
      alert(error.message || 'படம் பதிவேற்றுவதில் பிழை (Upload failed)');
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsPdfUploading(true);
    setPdfName(file.name);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('premium-pdfs')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      setPdfPath(filePath);
    } catch (error: any) {
      alert(error.message || 'PDF பதிவேற்றுவதில் பிழை (Upload failed)');
    } finally {
      setIsPdfUploading(false);
    }
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const payload = { ...data, cover_image_url: coverImage, pdf_url: pdfPath };
      const res = await fetch('/api/admin/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const newIssue = await res.json();
        router.push(`/admin/issues/${newIssue.id}/edit`);
      } else {
        const error = await res.json();
        alert(error.error || error.message || 'பிழை ஏற்பட்டது');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/admin/issues" className="p-2 hover:bg-accent rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold font-serif">புதிய இதழ் உருவாக்கு (Create New Issue)</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
          
          <div>
            <label className="block text-sm font-medium mb-2 font-sans">இதழ் தலைப்பு (Issue Title)</label>
            <input
              {...register('title', { required: 'தலைப்பு தேவை' })}
              className="w-full p-3 rounded-md border bg-background font-serif text-lg"
              placeholder="எ.கா: சட்டவிளக்கு - சிறப்பு மலர்"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message as string}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">தொகுதி (Volume)</label>
              <input
                type="number"
                {...register('volume_number', { valueAsNumber: true })}
                onChange={handleVolumeIssueChange}
                className="w-full p-2 rounded-md border bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">இதழ் எண் (Issue Number)</label>
              <input
                type="number"
                {...register('issue_number', { valueAsNumber: true })}
                onChange={handleVolumeIssueChange}
                className="w-full p-2 rounded-md border bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">சுட்டி (Slug)</label>
              <input
                {...register('slug', { required: true })}
                className="w-full p-2 rounded-md border bg-muted"
                readOnly
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">சுருக்கம் (Description)</label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full p-3 rounded-md border bg-background font-serif"
              placeholder="இந்த இதழின் சிறப்பம்சங்கள்..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">அட்டைப்படம் (Cover Image)</label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-accent/50 transition-colors">
                <input type="file" id="cover" className="hidden" accept="image/*" onChange={handleImageUpload} />
                <label htmlFor="cover" className="cursor-pointer flex flex-col items-center gap-2">
                  {coverImage ? (
                    <img src={coverImage} alt="Cover preview" className="h-40 object-cover rounded shadow" />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">படத்தை பதிவேற்றவும் (Upload Image)</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="space-y-6">
               <div>
                  <label className="block text-sm font-medium mb-2">நிலை (Status)</label>
                  <select {...register('status')} className="w-full p-2 rounded-md border bg-background">
                    <option value="draft">வரைவு (Draft)</option>
                    <option value="published">வெளியிடப்பட்டது (Published)</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30">
                  <input type="checkbox" id="is_free" {...register('is_free')} className="h-5 w-5 rounded border-gray-300" />
                  <label htmlFor="is_free" className="font-medium cursor-pointer">இலவச இதழா? (Is Free Issue?)</label>
                </div>
          </div>
          </div>

          {/* PDF இதழ் கோப்பு பதிவேற்றம் (PDF Magazine Upload) */}
          <div className="border-t pt-6">
            <label className="block text-sm font-medium mb-2 font-sans">இதழ் PDF கோப்பு (Magazine PDF File)</label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-accent/50 transition-colors">
              <input type="file" id="pdf-file" className="hidden" accept="application/pdf" onChange={handlePdfUpload} />
              <label htmlFor="pdf-file" className="cursor-pointer flex flex-col items-center gap-2">
                {isPdfUploading ? (
                  <>
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    <span className="text-sm text-muted-foreground">பதிவேற்றப்படுகிறது... (Uploading...)</span>
                  </>
                ) : pdfPath ? (
                  <>
                    <FileText className="h-8 w-8 text-green-600" />
                    <span className="text-sm text-green-600 font-bold">PDF பதிவேற்றப்பட்டது: {pdfName || pdfPath}</span>
                    <span className="text-xs text-muted-foreground">(மாற்ற கிளிக் செய்யவும்)</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">இதழ் PDF கோப்பை பதிவேற்றவும் (Upload PDF File)</span>
                  </>
                )}
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link href="/admin/issues" className="px-6 py-2 border rounded-md hover:bg-accent">ரத்து செய்</Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground px-8 py-2 rounded-md font-bold flex items-center gap-2 hover:bg-primary/90"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            சேமி (Save)
          </button>
        </div>
      </form>
    </div>
  );
}
