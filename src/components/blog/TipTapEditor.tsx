import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  ImageIcon,
  Link as LinkIcon,
  Heading2,
  Heading3,
  Undo2,
  Redo2,
  Minus,
  SquareCode,
} from "lucide-react";
import { useBlogImageUpload } from "@/hooks/useBlogImageUpload";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

function ToolbarButton({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={`h-8 w-8 ${active ? "bg-accent/20 text-accent" : ""}`}
      onClick={onClick}
      title={title}
      aria-label={title}
    >
      {children}
    </Button>
  );
}

export function TipTapEditor({ content, onChange, placeholder, className }: TipTapEditorProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { uploadImage } = useBlogImageUpload(user?.id);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
      }),
      Placeholder.configure({ placeholder: placeholder ?? "Escribe el contenido del artículo..." }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none min-h-[200px] px-4 py-3 focus:outline-none [&_.ProseMirror-focused]:outline-none [&_.ProseMirror]:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  const handleImageUpload = useCallback(async () => {
    const input = fileInputRef.current;
    if (!input || !editor || !user) return;
    input.click();
  }, [editor, user]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;
      e.target.value = "";

      const result = await uploadImage(file);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      editor.chain().focus().setImage({ src: result.url }).run();
    },
    [editor, uploadImage]
  );

  const openLinkPopover = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href ?? "";
    setLinkUrl(previousUrl);
    setLinkPopoverOpen(true);
  }, [editor]);

  const applyLink = useCallback(() => {
    if (!editor) return;
    const trimmed = linkUrl.trim();
    if (!trimmed) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      const href = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
      editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    }
    setLinkPopoverOpen(false);
  }, [editor, linkUrl]);

  const removeLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkUrl("");
    setLinkPopoverOpen(false);
  }, [editor]);

  if (!editor) return null;

  return (
    <div className={`rounded-lg border border-input bg-muted/50 overflow-hidden ${className ?? ""}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="flex flex-wrap items-center gap-1 border-b border-input p-2 sticky top-0 z-10 bg-background">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title={t("admin.blog.toolbarUndo")}
        >
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title={t("admin.blog.toolbarRedo")}
        >
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>
        <div className="mx-1 h-6 w-px bg-border" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title={t("admin.blog.toolbarBold")}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title={t("admin.blog.toolbarItalic")}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title={t("admin.blog.toolbarStrike")}
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <div className="mx-1 h-6 w-px bg-border" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title={t("admin.blog.toolbarH2")}
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title={t("admin.blog.toolbarH3")}
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <div className="mx-1 h-6 w-px bg-border" />
        <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${editor.isActive("link") ? "bg-accent/20 text-accent" : ""}`}
              onClick={openLinkPopover}
              title={t("admin.blog.toolbarLink")}
              aria-label={t("admin.blog.toolbarLink")}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-3">
              <Input
                placeholder="https://..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyLink())}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={applyLink}>
                  {t("common.apply")}
                </Button>
                <Button size="sm" variant="outline" onClick={removeLink}>
                  {t("admin.blog.removeLink")}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <ToolbarButton onClick={handleImageUpload} title={t("admin.blog.toolbarImage")}>
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
        <div className="mx-1 h-6 w-px bg-border" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title={t("admin.blog.toolbarBulletList")}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title={t("admin.blog.toolbarOrderedList")}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title={t("admin.blog.toolbarBlockquote")}
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title={t("admin.blog.toolbarCode")}
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          title={t("admin.blog.toolbarCodeBlock")}
        >
          <SquareCode className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title={t("admin.blog.toolbarHorizontalRule")}
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
