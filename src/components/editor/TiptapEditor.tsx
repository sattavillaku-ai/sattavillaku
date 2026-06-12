'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import { Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Link as LinkIcon, Image as ImageIcon, Highlighter, Undo, Redo, Save } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TiptapEditorProps {
  initialContent?: any;
  onChange: (content: any, wordCount: number) => void;
  onSave?: () => void;
}

export function TiptapEditor({ initialContent, onChange, onSave }: TiptapEditorProps) {
  const [wordCount, setWordCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
      Highlight.configure({ HTMLAttributes: { class: 'bg-yellow-200 text-black px-1 rounded' } }),
      Image,
      Placeholder.configure({ placeholder: 'கட்டுரையை இங்கே தட்டச்சு செய்யவும்...' }),
    ],
    content: initialContent || '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[500px] font-serif leading-[1.8] text-[18px]',
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      const text = editor.getText();
      const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
      setWordCount(words);
      onChange(json, words);
    },
  });

  // Auto-save logic
  useEffect(() => {
    if (!onSave) return;
    const interval = setInterval(() => {
      setIsSaving(true);
      onSave();
      setTimeout(() => setIsSaving(false), 1000);
    }, 30000); // 30 வினாடிகள் (30 seconds)
    
    return () => clearInterval(interval);
  }, [onSave]);

  const addImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.url && editor) {
          editor.chain().focus().setImage({ src: data.url }).run();
        }
      } catch (error) {
        alert('படம் பதிவேற்றுவதில் பிழை');
      }
    };
    input.click();
  };

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('இணைப்பு முகவரி (URL):', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  if (!editor) return null;

  const ToolbarButton = ({ onClick, isActive = false, icon: Icon, title }: any) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded hover:bg-accent transition-colors ${isActive ? 'bg-accent text-primary' : 'text-muted-foreground'}`}
      title={title}
    >
      <Icon className="h-4 w-4" />
    </button>
  );

  return (
    <div className="border rounded-xl overflow-hidden bg-background flex flex-col h-full">
      {/* கருவிப்பட்டி (Toolbar) */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={Bold} title="தடிமன் (Bold)" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={Italic} title="சாய்வு (Italic)" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} icon={UnderlineIcon} title="கோடிட்டது (Underline)" />
        <div className="w-px h-6 bg-border mx-1" />
        
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} icon={Heading1} title="தலைப்பு 1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} icon={Heading2} title="தலைப்பு 2" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} icon={Heading3} title="தலைப்பு 3" />
        <div className="w-px h-6 bg-border mx-1" />
        
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={List} title="பட்டியல்" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={ListOrdered} title="எண் பட்டியல்" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} icon={Quote} title="மேற்கோள் (Blockquote)" />
        <div className="w-px h-6 bg-border mx-1" />
        
        <ToolbarButton onClick={setLink} isActive={editor.isActive('link')} icon={LinkIcon} title="இணைப்பு (Link)" />
        <ToolbarButton onClick={addImage} icon={ImageIcon} title="படம் (Image)" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} icon={Highlighter} title="சட்ட முன்னிலை (Highlight)" />
        <div className="w-px h-6 bg-border mx-1" />
        
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} icon={Undo} title="செயல்தவிர் (Undo)" />
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} icon={Redo} title="மீண்டும் செய் (Redo)" />
        
        <div className="flex-1" />
        
        {onSave && (
          <button
            type="button"
            onClick={onSave}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 rounded"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'சேமிக்கிறது...' : 'சேமி'}
          </button>
        )}
      </div>

      {/* எழுத்துப்பகுதி (Editor Content) */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 cursor-text" onClick={() => editor.commands.focus()}>
        <EditorContent editor={editor} />
      </div>
      
      {/* நிலைப்பட்டி (Status Bar) */}
      <div className="border-t p-2 px-4 flex justify-between items-center text-xs text-muted-foreground bg-muted/10">
        <span>வார்த்தை எண்ணிக்கை: {wordCount}</span>
        {isSaving && <span className="text-green-600 font-medium">தானாக சேமிக்கப்பட்டது</span>}
      </div>
    </div>
  );
}
