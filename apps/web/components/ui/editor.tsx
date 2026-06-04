"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered, Quote, Heading2, Undo, Redo } from "lucide-react";

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function Editor({ content, onChange }: EditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[300px] p-4",
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      <div className="flex items-center gap-1 border-b border-border p-2 bg-muted/30 flex-wrap">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg hover:bg-muted ${editor.isActive("bold") ? "bg-muted text-primary" : "text-muted-foreground"}`}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg hover:bg-muted ${editor.isActive("italic") ? "bg-muted text-primary" : "text-muted-foreground"}`}
        >
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-border mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded-lg hover:bg-muted ${editor.isActive("heading", { level: 2 }) ? "bg-muted text-primary" : "text-muted-foreground"}`}
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded-lg hover:bg-muted ${editor.isActive("blockquote") ? "bg-muted text-primary" : "text-muted-foreground"}`}
        >
          <Quote className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-border mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-lg hover:bg-muted ${editor.isActive("bulletList") ? "bg-muted text-primary" : "text-muted-foreground"}`}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-lg hover:bg-muted ${editor.isActive("orderedList") ? "bg-muted text-primary" : "text-muted-foreground"}`}
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>
      <EditorContent editor={editor} className="bg-background" />
    </div>
  );
}
