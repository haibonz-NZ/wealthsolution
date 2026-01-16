import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bold, Italic, List, ListOrdered, Quote, Heading1, Heading2, Undo, Redo, Save, Wand2 } from "lucide-react";
import { toast } from "sonner";

interface ReportEditorProps {
  initialContent: string;
  onSave: (content: string) => void;
  isGenerating?: boolean;
}

export function ReportEditor({ initialContent, onSave, isGenerating }: ReportEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: initialContent || '<p>正在准备报告内容...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] p-4',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const handleSave = () => {
    const html = editor.getHTML();
    onSave(html);
    toast.success("报告草稿已保存");
  };

  const handleAiPolish = () => {
    toast.info("AI 润色功能开发中...");
    // Here we would get the selected text and call DeepSeek to improve it
  };

  return (
    <Card className="border shadow-sm bg-white overflow-hidden flex flex-col h-full min-h-[600px]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b p-2 bg-slate-50 sticky top-0 z-10">
        <Button
          variant="ghost" size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-slate-200' : ''}
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost" size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-slate-200' : ''}
        >
          <Italic className="w-4 h-4" />
        </Button>
        <div className="w-px h-6 bg-slate-300 mx-1" />
        <Button
          variant="ghost" size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'bg-slate-200' : ''}
        >
          <Heading1 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost" size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-slate-200' : ''}
        >
          <Heading2 className="w-4 h-4" />
        </Button>
        <div className="w-px h-6 bg-slate-300 mx-1" />
        <Button
          variant="ghost" size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-slate-200' : ''}
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost" size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-slate-200' : ''}
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost" size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-slate-200' : ''}
        >
          <Quote className="w-4 h-4" />
        </Button>
        <div className="w-px h-6 bg-slate-300 mx-1" />
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()}>
          <Undo className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()}>
          <Redo className="w-4 h-4" />
        </Button>
        
        <div className="flex-1" />
        
        <Button variant="outline" size="sm" onClick={handleAiPolish} className="text-purple-600 border-purple-200 hover:bg-purple-50">
          <Wand2 className="w-4 h-4 mr-2" /> AI 润色
        </Button>
        
        <Button variant="default" size="sm" onClick={handleSave} disabled={isGenerating}>
          <Save className="w-4 h-4 mr-2" /> {isGenerating ? '生成中...' : '保存'}
        </Button>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto bg-white p-4">
        <EditorContent editor={editor} className="min-h-full" />
      </div>
    </Card>
  );
}
