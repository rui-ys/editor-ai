<template>
  <div class="ai-menu">
    <!-- Existing AI action buttons -->
    <button @click="improveWriting">润色</button>
    <button @click="summarizeText">总结</button>
    <button @click="translateText('en')">翻译 (英)</button>
    <button @click="fixGrammar">修正语法</button>

    <!-- Model Selector Trigger -->
    <div class="model-selector-container">
      <button @click="toggleModelSelector" class="model-selector-trigger">
        <span class="model-icon">{{ currentModelIcon }}</span>
        {{ currentModelName }}
        <span class="dropdown-arrow">▼</span>
      </button>
      <ModelSelector
        v-if="showSelector"
        class="model-selector-dropdown"
        @close="showSelector = false"
        @model-selected="handleModelSelected"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { Editor } from '@tiptap/core';
import ModelSelector from './ModelSelector.vue'; // Import the new component
import { aiConfig, getCurrentModel } from '../config/aiConfig'; // Import config and getter
import type { AiModel } from '../config/aiModels'; // Import type

const props = defineProps<{
  editor: Editor;
}>();

const showSelector = ref(false);
const currentModel = ref<AiModel | undefined>(getCurrentModel());

// Computed property for the current model's display name
const currentModelName = computed(() => {
  return currentModel.value?.name || '选择模型';
});

// Computed property for the current model's icon (example)
const currentModelIcon = computed(() => {
  const model = currentModel.value;
  if (!model) return '?';
  // Example: return specific characters or map to icon classes
  if (model.provider === 'anthropic') return 'A';
  if (model.provider === 'google') return '✦';
  if (model.provider === 'openai') return '⚛︎'; // Using an atom symbol as placeholder
  if (model.provider === 'deepseek') return '🧠'; // Using a brain emoji as placeholder
  if (model.provider === 'custom') return '⚙️';
  return '?';
});


const toggleModelSelector = () => {
  showSelector.value = !showSelector.value;
};

const handleModelSelected = (modelId: string) => {
  // aiConfig is reactive, so getCurrentModel should update automatically
  // We just need to update our local ref to trigger re-computation
  currentModel.value = getCurrentModel();
  console.log(`AiMenu: Model selected - ${modelId}`);
  // Selector is closed by its own emit('close')
};

// Close selector if clicking outside
const handleClickOutside = (event: MouseEvent) => {
    // Ensure the click is outside the entire container, including the dropdown
    const container = document.querySelector('.model-selector-container');
    if (container && !container.contains(event.target as Node)) {
        showSelector.value = false;
    }
};

onMounted(() => {
    // Use capture phase to catch clicks early, especially if event propagation is stopped elsewhere
    document.addEventListener('click', handleClickOutside, true);
    // Update local currentModel initially
    currentModel.value = getCurrentModel();
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside, true);
});


// --- AI Action Methods ---
const improveWriting = () => {
  try {
    // Simplified approach - don't check if command exists
    const selection = props.editor.state.selection;
    const selectedText = props.editor.state.doc.textBetween(
      selection.from, 
      selection.to,
      ' '
    );
    
    if (!selectedText || selectedText.trim() === '') {
      alert('请选择需要润色的文本');
      return;
    }
    
    // 获取当前选择的模型信息
    const model = currentModel.value;
    console.log(`使用模型 ${model?.name || '未知'} 润色文本:`, selectedText);
    
    // 根据不同模型可以有不同的处理逻辑
    let improvedText = '';
    
    if (!model) {
      alert('请先选择一个AI模型');
      return;
    }
    
    // 这里可以根据不同的模型进行不同的处理
    // 目前使用占位实现，实际项目中应该调用相应的API
    improvedText = `${selectedText} (由${model.name}润色)`;
    
    props.editor.chain().focus().deleteSelection().insertContent(improvedText).run();
  } catch (error) {
    console.error('润色文本时出错:', error);
    alert('润色文本失败，请重试。');
  }
};

const summarizeText = () => {
  try {
    const selection = props.editor.state.selection;
    const selectedText = props.editor.state.doc.textBetween(
      selection.from, 
      selection.to,
      ' '
    );
    
    if (!selectedText || selectedText.trim() === '') {
      alert('请选择需要总结的文本');
      return;
    }
    
    // 获取当前选择的模型信息
    const model = currentModel.value;
    console.log(`使用模型 ${model?.name || '未知'} 总结文本:`, selectedText);
    
    if (!model) {
      alert('请先选择一个AI模型');
      return;
    }
    
    // 根据不同模型可以有不同的处理逻辑
    // 目前使用占位实现，实际项目中应该调用相应的API
    const summarizedText = `${selectedText.substring(0, selectedText.length / 3)}... (由${model.name}总结)`;
    
    props.editor.chain().focus().deleteSelection().insertContent(summarizedText).run();
  } catch (error) {
    console.error('总结文本时出错:', error);
    alert('总结文本失败，请重试。');
  }
};

const translateText = (targetLang: string) => {
  try {
    const selection = props.editor.state.selection;
    const selectedText = props.editor.state.doc.textBetween(
      selection.from, 
      selection.to,
      ' '
    );
    
    if (!selectedText || selectedText.trim() === '') {
      alert('请选择需要翻译的文本');
      return;
    }
    
    // 获取当前选择的模型信息
    const model = currentModel.value;
    console.log(`使用模型 ${model?.name || '未知'} 翻译文本到 ${targetLang}:`, selectedText);
    
    if (!model) {
      alert('请先选择一个AI模型');
      return;
    }
    
    // 根据不同模型可以有不同的处理逻辑
    // 目前使用占位实现，实际项目中应该调用相应的API
    const translatedText = `${selectedText} (由${model.name}翻译为${targetLang === 'en' ? '英文' : targetLang})`;
    
    props.editor.chain().focus().deleteSelection().insertContent(translatedText).run();
  } catch (error) {
    console.error('翻译文本时出错:', error);
    alert('翻译文本失败，请重试。');
  }
};

const fixGrammar = () => {
  try {
    const selection = props.editor.state.selection;
    const selectedText = props.editor.state.doc.textBetween(
      selection.from, 
      selection.to,
      ' '
    );
    
    if (!selectedText || selectedText.trim() === '') {
      alert('请选择需要修正语法的文本');
      return;
    }
    
    // 获取当前选择的模型信息
    const model = currentModel.value;
    console.log(`使用模型 ${model?.name || '未知'} 修正语法:`, selectedText);
    
    if (!model) {
      alert('请先选择一个AI模型');
      return;
    }
    
    // 根据不同模型可以有不同的处理逻辑
    // 目前使用占位实现，实际项目中应该调用相应的API
    const fixedText = `${selectedText} (由${model.name}修正语法)`;
    
    props.editor.chain().focus().deleteSelection().insertContent(fixedText).run();
  } catch (error) {
    console.error('修正语法时出错:', error);
    alert('修正语法失败，请重试。');
  }
};
</script>

<style scoped>
.ai-menu {
  display: flex;
  align-items: center;
  gap: 8px; /* 增加了按钮之间的间距 */
  background-color: #f8f9fa; /* 添加浅灰色背景 */
  color: #343a40; /* 添加深灰色字体颜色 */
  padding: 5px; /* 添加一些内边距，让背景色可见 */
  border-radius: 4px; /* 可选：添加圆角 */
  border-bottom: 1px solid #dee2e6; /* 可选：添加底部边框与其他区域分隔 */
}

/* 调整普通 AI 操作按钮的样式 */
.ai-menu button {
  padding: 5px 10px; /* 稍微增大内边距 */
  border: 1px solid #bbb; /* 边框颜色变浅一点 */
  background-color: #e8e8e8; /* 背景色稍微改变 */
  color: #343a40; /* 确保按钮文字也是深色 */
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px; /* 字体稍大一点 */
  transition: background-color 0.2s ease; /* 添加悬停过渡效果 */
  white-space: nowrap; /* 防止按钮文本换行 */;
}

.ai-menu button:hover {
  background-color: #dcdcdc; /* 悬停背景色 */
}

.model-selector-container {
  position: relative; /* Context for the dropdown */
  margin-left: 5px; /* 在模型选择器前增加一点左边距 */
}

/* 调整模型选择器触发按钮的样式 */
.model-selector-trigger {
  display: flex;
  align-items: center;
  gap: 5px; /* 图标和文字间距 */
  background-color: #495057; /* 调整模型选择器按钮背景色以适应新菜单背景 */
  color: #f8f9fa; /* 调整模型选择器按钮文字颜色 */
  border: 1px solid #6c757d; /* 调整边框 */
  padding: 5px 10px; /* 与其他按钮保持一致的内边距 */
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px; /* 与其他按钮保持一致的字体大小 */
  transition: background-color 0.2s ease; /* 添加悬停过渡效果 */
}

.model-selector-trigger:hover {
  background-color: #6c757d; /* 调整悬停背景色 */
}

.model-icon {
  font-size: 15px; /* 图标稍大一点 */
  width: 18px;
  text-align: center;
  line-height: 1; /* 确保图标垂直居中 */
}

.dropdown-arrow {
  font-size: 11px; /* 箭头稍大一点 */
  margin-left: 5px; /* 箭头与文字间距 */
}

.model-selector-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 5px; /* 下拉菜单与按钮的距离 */
  z-index: 10;
  /* Styles are inherited from ModelSelector.vue */
}
</style>