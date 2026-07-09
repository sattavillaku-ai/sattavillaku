'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Loader2, Upload, ArrowLeft, GripVertical, Trash2, Edit2, PlusCircle, FileText, Sparkles, X, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createClient } from '@/lib/supabase/client';

// Sortable Article Item Component
function SortableArticle({ article, onEdit, onDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: article.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-4 p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
      <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground">
        <GripVertical className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <h4 className="font-bold font-serif">{article.title}</h4>
        <div className="flex gap-3 text-xs text-muted-foreground mt-1">
          <span>{article.author_name}</span>
          <span className="bg-primary/10 text-primary px-2 rounded-full">{article.content_type}</span>
          {article.is_preview && <span className="bg-green-100 text-green-700 px-2 rounded-full">முன்னோட்டம் (Preview)</span>}
        </div>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => onEdit(article)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"><Edit2 className="h-4 w-4" /></button>
        <button type="button" onClick={() => onDelete(article.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-md"><Trash2 className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

function tiptapToText(content: any): string {
  if (!content) return '';
  if (typeof content === 'string') {
    try {
      content = JSON.parse(content);
    } catch (e) {
      return content;
    }
  }
  if (content.type === 'doc' && Array.isArray(content.content)) {
    return content.content
      .map((node: any) => {
        if (node.type === 'image') return '';
        if (node.content && Array.isArray(node.content)) {
          const text = node.content.map((c: any) => c.text || '').join('');
          if (node.type === 'heading') {
            return `${'#'.repeat(node.attrs?.level || 2)} ${text}`;
          }
          return text;
        }
        return '';
      })
      .filter((text: string) => text.length > 0)
      .join('\n\n');
  }
  return '';
}

function extractImageFromTiptap(content: any): string | null {
  if (!content) return null;
  if (typeof content === 'string') {
    try {
      content = JSON.parse(content);
    } catch (e) {
      return null;
    }
  }
  if (content.type === 'doc' && Array.isArray(content.content)) {
    const imageNode = content.content.find((node: any) => node.type === 'image');
    return imageNode?.attrs?.src || null;
  }
  return null;
}

function textToTiptap(text: string, imageUrl?: string | null) {
  const paragraphs = text
    .split('\n')
    .map(p => p.trim())
    .filter(p => p.length > 0);
    
  const contentList: any[] = [];
  
  if (imageUrl) {
    contentList.push({
      type: "image",
      attrs: { src: imageUrl }
    });
  }
  
  paragraphs.forEach(p => {
    if (p.startsWith('###')) {
      contentList.push({
        type: "heading",
        attrs: { level: 3 },
        content: [{ type: "text", text: p.replace(/^###\s*/, '') }]
      });
    } else if (p.startsWith('##')) {
      contentList.push({
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: p.replace(/^##\s*/, '') }]
      });
    } else {
      contentList.push({
        type: "paragraph",
        content: [{ type: "text", text: p }]
      });
    }
  });
    
  return {
    type: "doc",
    content: contentList
  };
}

export default function EditIssuePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [pdfPath, setPdfPath] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const [isPdfUploading, setIsPdfUploading] = useState(false);
  const [articles, setArticles] = useState<any[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [fullPdfUrl, setFullPdfUrl] = useState<string | null>(null);

  // Article Modal & Editor States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalAuthorName, setModalAuthorName] = useState('');
  const [modalContentType, setModalContentType] = useState('article');
  const [modalIsPreview, setModalIsPreview] = useState(false);
  const [modalPlainContent, setModalPlainContent] = useState('');
  const [isSavingArticle, setIsSavingArticle] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
  const [isArticleImageUploading, setIsArticleImageUploading] = useState(false);

  const openAddModal = () => {
    setEditingArticle(null);
    setModalTitle('');
    setModalAuthorName('ஆசிரியர் குழு');
    setModalContentType('article');
    setModalIsPreview(false);
    setModalPlainContent('');
    setModalImageUrl(null);
    setIsModalOpen(true);
  };

  const openEditModal = (article: any) => {
    setEditingArticle(article);
    setModalTitle(article.title || '');
    setModalAuthorName(article.author_name || 'ஆசிரியர் குழு');
    setModalContentType(article.content_type || 'article');
    setModalIsPreview(article.is_preview || false);
    setModalPlainContent(tiptapToText(article.content));
    setModalImageUrl(extractImageFromTiptap(article.content));
    setIsModalOpen(true);
  };

  const handleArticleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsArticleImageUploading(true);
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

      setModalImageUrl(publicUrl);
    } catch (error: any) {
      alert('படம் பதிவேற்றுவதில் பிழை: ' + error.message);
    } finally {
      setIsArticleImageUploading(false);
    }
  };

  const handleSaveArticle = async () => {
    setIsSavingArticle(true);
    try {
      const payload = {
        title: modalTitle,
        author_name: modalAuthorName || 'ஆசிரியர் குழு',
        content_type: modalContentType,
        is_preview: modalIsPreview,
        content: textToTiptap(modalPlainContent, modalImageUrl),
      };

      let res;
      if (editingArticle) {
        res = await fetch(`/api/admin/issues/${resolvedParams.id}/content`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingArticle.id, ...payload })
        });
      } else {
        res = await fetch(`/api/admin/issues/${resolvedParams.id}/content`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        setIsModalOpen(false);
        const articlesRes = await fetch(`/api/admin/issues/${resolvedParams.id}/content`);
        if (articlesRes.ok) setArticles(await articlesRes.json());
      } else {
        const error = await res.json();
        alert(error.error || 'கட்டுரையை சேமிப்பதில் பிழை.');
      }
    } catch (err: any) {
      alert('பிழை: ' + err.message);
    } finally {
      setIsSavingArticle(false);
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (!confirm('இந்த கட்டுரையை நீக்க விரும்புகிறீர்களா?')) return;
    try {
      const res = await fetch(`/api/admin/issues/${resolvedParams.id}/content?article_id=${articleId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setArticles(articles.filter(a => a.id !== articleId));
      } else {
        const error = await res.json();
        alert(error.error || 'கட்டுரையை நீக்குவதில் பிழை.');
      }
    } catch (err: any) {
      alert('பிழை: ' + err.message);
    }
  };

  const handleAIExtract = async () => {
    if (!pdfPath) {
      alert('தயவுசெய்து முதலில் ஒரு PDF கோப்பை பதிவேற்றிவிட்டு இதை முயற்சிக்கவும்.');
      return;
    }
    
    if (!confirm('AI மூலம் கட்டுரைகளைப் பிரித்தெடுக்க விரும்புகிறீர்களா? இது ஏற்கனவே உள்ள கட்டுரைகளை நீக்கிவிட்டு புதிதாக உருவாக்கும்.')) {
      return;
    }
    
    setIsExtracting(true);
    try {
      const res = await fetch(`/api/admin/issues/${resolvedParams.id}/extract-articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdf_path: pdfPath })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`வெற்றிகரமாக ${data.count} கட்டுரைகள் பிரித்தெடுக்கப்பட்டன!`);
        // Refresh articles list
        const articlesRes = await fetch(`/api/admin/issues/${resolvedParams.id}/content`);
        if (articlesRes.ok) setArticles(await articlesRes.json());
      } else {
        alert(data.error || 'பிரித்தெடுப்பதில் பிழை ஏற்பட்டது.');
      }
    } catch (err: any) {
      alert('பிழை: ' + err.message);
    } finally {
      setIsExtracting(false);
    }
  };

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
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

  // Load Issue Data
  useEffect(() => {
    const fetchIssue = async () => {
      const res = await fetch(`/api/admin/issues/${resolvedParams.id}`);
      if (res.ok) {
        const data = await res.json();
        reset(data);
        setCoverImage(data.cover_image_url);
        setFullPdfUrl(data.pdf_url);
        
        const rawPdfPath = data.pdf_url && data.pdf_url.includes('|') 
          ? data.pdf_url.split('|')[0] 
          : data.pdf_url;
          
        setPdfPath(rawPdfPath);
        if (rawPdfPath) {
          const parts = rawPdfPath.split('/');
          setPdfName(parts[parts.length - 1]);
        }
      }
    };
    const fetchArticles = async () => {
      const res = await fetch(`/api/admin/issues/${resolvedParams.id}/content`);
      if (res.ok) setArticles(await res.json());
    };
    fetchIssue();
    fetchArticles();
  }, [resolvedParams.id, reset]);

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
      let finalPdfUrl = pdfPath;
      if (fullPdfUrl && fullPdfUrl.includes('|')) {
        const [raw, gen] = fullPdfUrl.split('|');
        if (pdfPath === raw) {
          finalPdfUrl = `${raw}|${gen}`;
        }
      }
      const payload = { ...data, cover_image_url: coverImage, pdf_url: finalPdfUrl };
      const res = await fetch(`/api/admin/issues/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert('சேமிக்கப்பட்டது!');
      } else {
        const error = await res.json();
        alert(error.error || error.message || 'பிழை ஏற்பட்டது');
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'பிழை ஏற்பட்டது');
    } finally {
      setIsSubmitting(false);
    }
  };

  // DnD Handlers
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = articles.findIndex((i) => i.id === active.id);
      const newIndex = articles.findIndex((i) => i.id === over.id);
      const newArticles = arrayMove(articles, oldIndex, newIndex);
      
      setArticles(newArticles);
      
      const reorderedPayload = newArticles.map((art, idx) => ({
        id: art.id,
        position: idx + 1
      }));
      
      try {
        const res = await fetch(`/api/admin/issues/${resolvedParams.id}/content`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reorderedPayload)
        });
        if (!res.ok) throw new Error('வரிசையை சேமிக்க முடியவில்லை.');
      } catch (err: any) {
        alert('பிழை: ' + err.message);
        const rollbackRes = await fetch(`/api/admin/issues/${resolvedParams.id}/content`);
        if (rollbackRes.ok) setArticles(await rollbackRes.json());
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/issues" className="p-2 hover:bg-accent rounded-full"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="text-3xl font-bold font-serif">இதழை திருத்து (Edit Issue)</h1>
        </div>
        <button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-bold flex items-center gap-2">
           {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />} சேமி
        </button>
      </div>

      <form className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
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
      </form>

      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold font-serif flex items-center gap-2">
            கட்டுரைகள் (Articles)
            <span className="bg-primary text-primary-foreground text-sm px-2 py-0.5 rounded-full">{articles.length}</span>
          </h2>
          <div className="flex gap-3">
            <button 
              type="button"
              onClick={handleAIExtract}
              disabled={isExtracting}
              className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
            >
              {isExtracting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} AI வழி பிரித்தெடுத்தல்
            </button>
            <button 
              type="button" 
              onClick={openAddModal}
              className="text-sm bg-accent text-accent-foreground px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-muted"
            >
              <PlusCircle className="h-4 w-4" /> கட்டுரை சேர்
            </button>
          </div>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={articles} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {articles.map((article) => (
                <SortableArticle key={article.id} article={article} onEdit={openEditModal} onDelete={handleDeleteArticle} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Article Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-6 border-b bg-muted/20">
              <h3 className="text-xl font-bold font-serif">
                {editingArticle ? 'கட்டுரையை திருத்து (Edit Article)' : 'புதிய கட்டுரை சேர் (Add New Article)'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-accent rounded-full text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-sm font-medium mb-1">கட்டுரை தலைப்பு (Article Title)</label>
                <input 
                  type="text" 
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  className="w-full p-2.5 rounded-md border bg-background font-serif text-base"
                  placeholder="கட்டுரையின் தலைப்பை தட்டச்சு செய்யவும்..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">ஆசிரியர் பெயர் (Author Name)</label>
                  <input 
                    type="text" 
                    value={modalAuthorName}
                    onChange={(e) => setModalAuthorName(e.target.value)}
                    className="w-full p-2.5 rounded-md border bg-background"
                    placeholder="ஆசிரியர் பெயர்..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">வகை (Type)</label>
                  <select 
                    value={modalContentType}
                    onChange={(e) => setModalContentType(e.target.value)}
                    className="w-full p-2.5 rounded-md border bg-background"
                  >
                    <option value="article">கட்டுரை (Article)</option>
                    <option value="poem">கவிதை (Poem)</option>
                    <option value="editorial">தலையங்கம் (Editorial)</option>
                    <option value="story">கதை (Story)</option>
                    <option value="interview">நேர்காணல் (Interview)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
                <input 
                  type="checkbox" 
                  id="modal_is_preview" 
                  checked={modalIsPreview}
                  onChange={(e) => setModalIsPreview(e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300"
                />
                <label htmlFor="modal_is_preview" className="font-medium cursor-pointer text-sm">
                  இலவச முன்னோட்டம்? (Is Free Preview?)
                </label>
              </div>

              {/* Image Upload for Article */}
              <div>
                <label className="block text-sm font-medium mb-1">கட்டுரை படம் (Article Featured Image)</label>
                <div className="border border-dashed rounded-lg p-4 text-center hover:bg-accent/50 transition-colors relative bg-muted/10">
                  <input 
                    type="file" 
                    id="article_image_input" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleArticleImageUpload} 
                    disabled={isArticleImageUploading}
                  />
                  <label htmlFor="article_image_input" className="cursor-pointer flex flex-col items-center gap-2">
                    {isArticleImageUploading ? (
                      <>
                        <Loader2 className="h-6 w-6 text-primary animate-spin" />
                        <span className="text-xs text-muted-foreground">பதிவேற்றப்படுகிறது...</span>
                      </>
                    ) : modalImageUrl ? (
                      <>
                        <img src={modalImageUrl} alt="Article preview" className="h-28 object-cover rounded shadow mx-auto" />
                        <span className="text-xs text-muted-foreground">(படத்தை மாற்ற கிளிக் செய்யவும்)</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">படத்தை பதிவேற்றவும் (Upload Article Image)</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">உள்ளடக்கம் (Content)</label>
                <textarea 
                  value={modalPlainContent}
                  onChange={(e) => setModalPlainContent(e.target.value)}
                  rows={12}
                  className="w-full p-3 rounded-md border bg-background font-serif text-base leading-relaxed"
                  placeholder="கட்டுரையின் உள்ளடக்கத்தை தட்டச்சு செய்யவும். பத்திகளை பிரிக்க Enter அழுத்தவும். தலைப்புகளுக்கு ## பயன்படுத்தவும்."
                />
              </div>
            </div>

            <div className="p-6 border-t bg-muted/20 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border rounded-md font-medium text-sm hover:bg-accent transition-colors"
              >
                ரத்துசெய் (Cancel)
              </button>
              <button 
                onClick={handleSaveArticle}
                disabled={isSavingArticle || !modalTitle.trim()}
                className="px-5 py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 rounded-md font-semibold text-sm flex items-center gap-2 transition-colors"
              >
                {isSavingArticle && <Loader2 className="h-4 w-4 animate-spin" />}
                சேமி (Save)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
