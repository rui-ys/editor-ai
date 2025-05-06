<template>
  <div class="editor-container">
    <div class="editor-toolbar">
      <menu-bar v-if="editor" :editor="editor" />
    </div>
    <!-- 移除重复的editor-content组件，使用MenuBar.vue中的实现 -->
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, shallowRef } from 'vue';
import { Editor, Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight'
const lowlight = createLowlight(common)
import { EditorContent } from '@tiptap/vue-3';
import MenuBar from './MenuBar.vue';
import { AiExtension } from '../extensions/AiExtension';
import { aiConfig, getCurrentModel } from '../config/aiConfig';

// 使用 shallowRef 避免不必要的深度响应
const editor = shallowRef<Editor | null>(null);

// 定义AI续写函数
const triggerAiCompletion = async (editor: Editor) => {
  const { state } = editor;
  const { selection } = state;
  const { from } = selection;
  
  // 获取光标前的文本作为上下文
  const textBefore = state.doc.textBetween(Math.max(0, from - 500), from);
  if (!textBefore.trim()) return false; // 如果没有文本，不触发AI
  
  // 设置加载状态
  editor.commands.setMeta('aiAction', { type: 'loading', from, to: from });
  
  try {
    // 调用AI API获取续写内容
    const prompt = "请根据以下文本进行智能续写（保持原文风格和上下文）：";
    // 使用AiExtension中的callAIAPI函数
    // 这里需要通过编辑器实例访问callAIAPI，或者直接导入该函数
    // 由于callAIAPI是AiExtension内部函数，这里我们通过编辑器命令来触发
    
    // 获取当前选中的模型和配置
    const currentModel = getCurrentModel();
    if (!currentModel) {
      console.error("未选择AI模型");
      editor.commands.setMeta('aiAction', { type: 'error', from, to: from, message: "未选择AI模型" });
      return false;
    }
    
    // 使用编辑器的improveWriting命令作为替代方案来触发AI续写
    // 这里我们先插入一个临时标记，然后用AI生成的内容替换它
    const tempMarker = "[AI续写中...]";
    editor.chain().focus().insertContentAt(from, tempMarker).run();
    
    // 使用编辑器命令触发AI请求
    editor.commands.improveWriting();
    
    return true;
  } catch (error) {
    console.error("AI续写错误:", error);
    editor.commands.setMeta('aiAction', { type: 'error', from, to: from, message: String(error) });
    return false;
  }
};

onMounted(() => {
  editor.value = new Editor({
    extensions: [
      // Disable the default codeBlock extension in StarterKit
      StarterKit.configure({
        codeBlock: false, // This disables the default codeBlock extension
      }),
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      // Use the enhanced CodeBlockLowlight instead
      CodeBlockLowlight.configure({
        lowlight,
      }),
      AiExtension.configure({
        openai: aiConfig.openai,
        wenxin: aiConfig.wenxin,
        spark: aiConfig.spark,
      }),
      // 添加键盘事件处理
      Extension.create({
        name: 'aiKeyboardTrigger',
        addKeyboardShortcuts() {
          return {
            // Tab键触发AI续写
            'Tab': () => {
              triggerAiCompletion(this.editor);
              return true; // 阻止默认Tab行为
            },
            // 空格键触发AI续写（仅在特定条件下）
            'Space': ({ editor }) => {
              // 获取光标前的文本
              const { state } = editor;
              const { selection } = state;
              const { from } = selection;
              const textBefore = state.doc.textBetween(Math.max(0, from - 50), from);
              
              // 检查是否满足触发条件（例如，句子结束后）
              // 这里可以根据需要调整条件，例如句号、问号、感叹号后触发
              if (/[.!?。！？]\s*$/.test(textBefore.trim())) {
                // 先插入空格
                editor.commands.insertContent(' ');
                // 然后触发AI续写
                triggerAiCompletion(editor);
                return true;
              }
              
              // 不满足条件时，执行默认空格行为
              return false;
            },
          };
        },
      }),
    ],
    content: '<p>开始编辑内容...</p>',
    onUpdate: ({ editor }) => {
      console.log('内容已更新:', editor.getHTML());
    },
    onSelectionUpdate: () => {
      console.log('选区已更新');
    },
  });
});

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy();
  }
});

// 暴露编辑器实例，以便父组件可以访问
defineExpose({
  editor,
});
</script>

<style>
.editor-container {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  background-color: #fff;
  margin-bottom: 20px;
}

.editor-toolbar {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  background-color: #f8fafc;
}

.editor-content {
  padding: 1.5rem;
  min-height: 300px;
  line-height: 1.6;
  color: #334155;
  font-size: 16px;
}

/* 基本样式 */
.editor-content p {
  margin: 1em 0;
}

.editor-content h1,
.editor-content h2,
.editor-content h3,
.editor-content h4,
.editor-content h5,
.editor-content h6 {
  margin-top: 1.5em;
  margin-bottom: 0.75em;
  font-weight: 600;
  line-height: 1.3;
  color: #1e293b;
}

.editor-content h1 { font-size: 2em; }
.editor-content h2 { font-size: 1.75em; }
.editor-content h3 { font-size: 1.5em; }
.editor-content h4 { font-size: 1.25em; }
.editor-content h5 { font-size: 1.1em; }
.editor-content h6 { font-size: 1em; }

.editor-content ul,
.editor-content ol {
  padding-left: 2em;
  margin: 1em 0;
}

.editor-content li {
  margin-bottom: 0.5em;
}

.editor-content blockquote {
  border-left: 4px solid #cbd5e1;
  padding-left: 1em;
  margin-left: 0;
  color: #64748b;
  font-style: italic;
}

.editor-content pre {
  background-color: #f1f5f9;
  padding: 1em;
  border-radius: 6px;
  overflow-x: auto;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 0.9em;
  margin: 1.2em 0;
}

.editor-content code {
  background-color: #f1f5f9;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 0.9em;
}

.editor-content img {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  margin: 1em 0;
}

.editor-content a {
  color: #3b82f6;
  text-decoration: none;
}

.editor-content a:hover {
  text-decoration: underline;
}

.editor-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 1.5em 0;
  overflow-x: auto;
  display: block;
}

.editor-content th {
  background-color: #f8fafc;
  font-weight: 600;
}

.editor-content th,
.editor-content td {
  border: 1px solid #e2e8f0;
  padding: 0.75em;
  text-align: left;
}

.editor-content tr:nth-child(even) {
  background-color: #f8fafc;
}

/* 任务列表样式 */
.editor-content ul[data-type="taskList"] {
  list-style: none;
  padding: 0;
}

.editor-content ul[data-type="taskList"] li {
  display: flex;
  align-items: flex-start;
  margin-bottom: 0.5em;
}

.editor-content ul[data-type="taskList"] li > label {
  margin-right: 0.5em;
}

.editor-content ul[data-type="taskList"] li > div {
  flex: 1;
}

/* 选中文本的样式 */
.editor-content ::selection {
  background-color: #bfdbfe;
}

/* AI状态样式 */
.ai-loading {
  background-color: rgba(255, 238, 130, 0.5);
  animation: pulse 1.5s infinite;
}

.ai-error {
  background-color: rgba(255, 182, 193, 0.6);
  text-decoration: underline wavy red;
  cursor: help;
}

@keyframes pulse {
  0% { background-color: rgba(255, 238, 130, 0.5); }
  50% { background-color: rgba(255, 238, 130, 0.8); }
  100% { background-color: rgba(255, 238, 130, 0.5); }
}
</style>