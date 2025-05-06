<template>
  <div class="app-container">
    <h1>TipTap AI 编辑器示例</h1>
    <tiptap-editor ref="editorComponent" />
    <!-- <div class="actions">
      <button @click="getHTML">获取 HTML</button>
      <button @click="getJSON">获取 JSON</button>
      <button @click="getText">获取纯文本</button>
      <button @click="clearContent">清空内容</button>
    </div>
    <div v-if="output" class="output">
      <h3>输出内容</h3>
      <pre>{{ output }}</pre>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TiptapEditor from './components/TiptapEditor.vue';

const editorComponent = ref(null);
const output = ref('');

const getHTML = () => {
  if (editorComponent.value?.editor) {
    output.value = editorComponent.value.editor.getHTML();
  }
};

const getJSON = () => {
  if (editorComponent.value?.editor) {
    output.value = JSON.stringify(editorComponent.value.editor.getJSON(), null, 2);
  }
};

const getText = () => {
  if (editorComponent.value?.editor) {
    output.value = editorComponent.value.editor.getText();
  }
};

const clearContent = () => {
  if (editorComponent.value?.editor) {
    editorComponent.value.editor.commands.clearContent();
    output.value = '';
  }
};
</script>

<style>
.app-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.app-container h1 {
  color: #1e293b;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.actions {
  margin-top: 1.5rem;
  display: flex;
  gap: 0.75rem;
}

.actions button {
  padding: 0.6rem 1.2rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.actions button:hover {
  background-color: #2563eb;
}

.actions button:nth-child(4) {
  background-color: #ef4444;
}

.actions button:nth-child(4):hover {
  background-color: #dc2626;
}

.output {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background-color: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.output h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #334155;
  font-weight: 600;
}

.output pre {
  white-space: pre-wrap;
  word-break: break-all;
  background-color: #f1f5f9;
  padding: 1rem;
  border-radius: 6px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 0.9em;
  color: #334155;
}
</style>