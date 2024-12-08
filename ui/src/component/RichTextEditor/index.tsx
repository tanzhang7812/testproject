import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  height?: number | string;
  placeholder?: string;
  disabled?: boolean;
}

const EditorWrapper = styled(Box)(({ theme }) => ({
  '& .tox-tinymce': {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
  },
  '& .tox-statusbar': {
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  '& .tox .tox-toolbar__primary': {
    background: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  '& .tox .tox-edit-area__iframe': {
    background: theme.palette.background.paper,
  },
  '& .tox .tox-tbtn': {
    color: theme.palette.text.primary,
    '&:hover': {
      background: theme.palette.action.hover,
    },
  },
  '& .tox .tox-tbtn--enabled, .tox .tox-tbtn--enabled:hover': {
    background: theme.palette.action.selected,
    color: theme.palette.primary.main,
  },
}));

export default function RichTextEditor({
  value,
  onChange,
  height = 500,
  placeholder = 'Write something...',
  disabled = false,
}: RichTextEditorProps) {
  const editorRef = useRef<any>(null);

  return (
    <EditorWrapper>
      <Editor
        apiKey="your-tinymce-api-key" // 需要替换为你的 TinyMCE API key
        onInit={(evt, editor) => editorRef.current = editor}
        value={value}
        onEditorChange={(newValue, editor) => onChange(newValue)}
        init={{
          height,
          menubar: true,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          placeholder,
          readonly: disabled,
          skin: 'oxide',
          // 自定义样式
          style_formats: [
            { title: 'Headers', items: [
              { title: 'Header 1', format: 'h1' },
              { title: 'Header 2', format: 'h2' },
              { title: 'Header 3', format: 'h3' },
              { title: 'Header 4', format: 'h4' },
              { title: 'Header 5', format: 'h5' },
              { title: 'Header 6', format: 'h6' }
            ]},
            { title: 'Inline', items: [
              { title: 'Bold', format: 'bold' },
              { title: 'Italic', format: 'italic' },
              { title: 'Underline', format: 'underline' },
              { title: 'Strikethrough', format: 'strikethrough' },
              { title: 'Code', format: 'code' }
            ]},
            { title: 'Blocks', items: [
              { title: 'Paragraph', format: 'p' },
              { title: 'Blockquote', format: 'blockquote' },
              { title: 'Div', format: 'div' },
              { title: 'Pre', format: 'pre' }
            ]}
          ],
          // 自定义颜色
          color_map: [
            "000000", "Black",
            "808080", "Gray",
            "FFFFFF", "White",
            "FF0000", "Red",
            "00FF00", "Green",
            "0000FF", "Blue",
            "FFFF00", "Yellow",
            "FF00FF", "Magenta",
            "00FFFF", "Cyan"
          ],
          // 自定义字体
          font_formats: 'Arial=arial,helvetica,sans-serif; Courier New=courier new,courier,monospace; AkrutiKndPadmini=Akpdmi-n',
          // 自定义字号
          fontsize_formats: '8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt 48pt',
          // 自定义行高
          lineheight_formats: '1 1.1 1.2 1.3 1.4 1.5 2',
        }}
      />
    </EditorWrapper>
  );
} 