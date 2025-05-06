<template>
  <div class="model-selector-popup">
    <div class="model-section">
      <div class="section-header">
        <span>内置模型</span>
        <span class="info-icon">ⓘ</span>
      </div>
      <ul>
        <li
          v-for="model in builtInModels"
          :key="model.id"
          :class="{ active: model.id === currentModelId }"
          @click="selectModel(model.id)"
        >
          <span class="model-icon">{{ getIcon(model) }}</span>
          <span class="model-name">{{ model.name }}</span>
          <span v-if="model.isNew" class="new-badge">New</span>
          <span v-if="model.id === currentModelId" class="checkmark">✓</span>
        </li>
      </ul>
    </div>

    <div class="model-section">
      <div class="section-header">
        <span>自定义模型</span>
        <span class="info-icon">ⓘ</span>
      </div>
      <ul>
        <li
          v-for="model in customModels"
          :key="model.id"
          :class="{ active: model.id === currentModelId }"
          @click="selectModel(model.id)"
        >
          <span class="model-icon">⚙️</span> <!-- Generic icon for custom -->
          <span class="model-name">{{ model.name }}</span>
           <span v-if="model.id === currentModelId" class="checkmark">✓</span>
          <button @click.stop="removeModel(model.id)" class="remove-btn">×</button>
        </li>
      </ul>
      <button class="add-model-btn" @click="showAddModal = true">
        <span class="plus-icon">+</span> 添加模型
      </button>
    </div>

    <!-- Add Custom Model Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
        <div class="modal-content">
            <button class="close-btn" @click="showAddModal = false">×</button>
            <h3>添加模型</h3>
            <div class="form-group">
                <label class="required-field">服务商</label>
                <div class="select-wrapper">
                    <select v-model="newModel.provider">
                        <option value="" disabled>选择模型服务商</option>
                        <option value="openai">OpenAI</option>
                        <option value="anthropic">Anthropic</option>
                        <option value="google">Google</option>
                        <option value="deepseek">DeepSeek</option>
                        <option value="custom">其他</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label class="required-field">模型</label>
                <div class="select-wrapper">
                    <select v-model="newModel.id" :disabled="!newModel.provider">
                        <option value="" disabled>选择模型</option>
                        <template v-if="newModel.provider === 'openai'">
                            <option value="gpt-4o">GPT-4o</option>
                            <option value="gpt-4.1">GPT-4.1</option>
                            <option value="gpt-3.5-turbo">GPT-3.5-Turbo</option>
                        </template>
                        <template v-else-if="newModel.provider === 'anthropic'">
                            <option value="claude-3.7-sonnet">Claude-3.7-Sonnet</option>
                            <option value="claude-3.5-sonnet">Claude-3.5-Sonnet</option>
                        </template>
                        <template v-else-if="newModel.provider === 'google'">
                            <option value="gemini-2.5-pro">Gemini-2.5-Pro</option>
                            <option value="gemini-1.5-pro">Gemini-1.5-Pro</option>
                        </template>
                        <template v-else-if="newModel.provider === 'deepseek'">
                            <option value="deepseek-v3">DeepSeek-V3</option>
                            <option value="deepseek-reasoner-r1">DeepSeek-Reasoner (R1)</option>
                        </template>
                        <option value="custom">自定义模型</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label class="required-field">API 密钥</label>
                <input type="text" v-model="newModel.apiKey" placeholder="输入 API 密钥">
            </div>
            <div class="modal-actions">
                <button @click="handleAddCustomModel">添加模型</button>
                <button @click="showAddModal = false">取消</button>
            </div>
        </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { aiConfig, setCurrentModel, addCustomModel, removeCustomModel } from '../config/aiConfig';
import type { AiModel } from '../config/aiModels';

const emit = defineEmits(['model-selected', 'close']);

const builtInModels = computed(() => aiConfig.models.builtIn);
const customModels = computed(() => aiConfig.models.custom);
const currentModelId = computed(() => aiConfig.models.currentModelId);

const showAddModal = ref(false);
const newModel = reactive({ 
  id: '', 
  name: '', 
  provider: '',
  apiKey: ''
});

const selectModel = (modelId: string) => {
  setCurrentModel(modelId);
  emit('model-selected', modelId);
  emit('close'); // Close the selector after selection
};

const removeModel = (modelId: string) => {
    if (confirm(`确定要删除自定义模型 "${customModels.value.find(m=>m.id===modelId)?.name}" 吗？`)) {
        removeCustomModel(modelId);
        // No need to emit close here, let the user continue interacting
    }
};

const handleAddCustomModel = () => {
    if (!newModel.provider || !newModel.id || !newModel.apiKey) {
        alert('服务商、模型和API密钥不能为空');
        return;
    }
    
    // 如果是自定义模型，使用服务商名称作为模型名称前缀
    const modelName = newModel.id === 'custom' 
        ? `${newModel.provider}-自定义` 
        : `${newModel.provider}-${newModel.id}`;
    
    const success = addCustomModel({ 
        id: `${newModel.provider}-${newModel.id}`, 
        name: modelName,
        provider: newModel.provider
    });
    
    if (success) {
        // Reset form and close modal
        newModel.id = '';
        newModel.name = '';
        newModel.provider = '';
        newModel.apiKey = '';
        showAddModal.value = false;
    } else {
        alert(`无法添加模型，该模型可能已存在。`);
    }
};


// Helper to get icon (replace with actual logic if using icons)
const getIcon = (model: AiModel) => {
  // Example: return specific characters or map to icon classes
  if (model.provider === 'anthropic') return 'A';
  if (model.provider === 'google') return '✦';
  if (model.provider === 'openai') return '⚛︎'; // Using an atom symbol as placeholder
  if (model.provider === 'deepseek') return '🧠'; // Using a brain emoji as placeholder
  return '?';
};

</script>

<style scoped>
/* Add styles based on the screenshot */
.model-selector-popup {
  background-color: #2c2c2c; /* Dark background */
  color: #e0e0e0; /* Light text */
  border-radius: 8px;
  padding: 8px;
  width: 250px; /* Adjust as needed */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  font-family: sans-serif;
  font-size: 14px;
}

.model-section {
  margin-bottom: 10px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  font-size: 12px;
  color: #a0a0a0; /* Lighter text for header */
  text-transform: uppercase; /* Or keep as is if matching screenshot */
}

.info-icon {
  cursor: help;
  border: 1px solid #a0a0a0;
  border-radius: 50%;
  width: 14px;
  height: 14px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  font-size: 10px;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 2px;
  position: relative; /* For positioning remove button */
}

li:hover {
  background-color: #404040; /* Hover background */
}

li.active {
  background-color: #4a4a4a; /* Selected background */
}

.model-icon {
  margin-right: 8px;
  width: 16px; /* Ensure icons align */
  text-align: center;
  /* Add styles for specific icons if needed */
}

.model-name {
  flex-grow: 1;
}

.new-badge {
  background-color: #e53e3e; /* Red background for 'New' */
  color: white;
  font-size: 10px;
  padding: 2px 5px;
  border-radius: 4px;
  margin-left: 6px;
  font-weight: bold;
}

.checkmark {
  color: #4caf50; /* Green checkmark */
  font-weight: bold;
  margin-left: 6px;
}

.add-model-btn {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 10px;
  background: none;
  border: none;
  color: #a0a0a0;
  cursor: pointer;
  text-align: left;
  border-radius: 4px;
  margin-top: 5px;
}

.add-model-btn:hover {
  background-color: #404040;
  color: #e0e0e0;
}

.plus-icon {
  margin-right: 8px;
  font-size: 16px;
}

.remove-btn {
    background: none;
    border: none;
    color: #a0a0a0;
    cursor: pointer;
    font-size: 16px;
    padding: 0 5px;
    margin-left: 5px;
    visibility: hidden; /* Hide by default */
}

li:hover .remove-btn {
    visibility: visible; /* Show on hover */
}

.remove-btn:hover {
    color: #e53e3e; /* Red on hover */
}


/* Basic Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background-color: #ffffff;
    padding: 15px;
    border-radius: 8px;
    color: #333333;
    width: 400px;
    max-width: 90vw;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
    margin-top: 0;
    margin-bottom: 15px;
    text-align: left;
    font-size: 16px;
    font-weight: bold;
    color: #333333;
    position: relative;
    padding-bottom: 10px;
    border-bottom: 1px solid #dddddd;
}

.form-group {
    margin-bottom: 10px;
}

.required-field::after {
    content: '*';
    color: #e53e3e;
    margin-left: 4px;
}

.select-wrapper {
    position: relative;
}

.select-wrapper::after {
    content: '▼';
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    font-size: 10px;
    color: #a0a0a0;
}

.modal-content input,
.modal-content select {
    width: 100%;
    padding: 8px 10px;
    margin-bottom: 5px;
    border-radius: 4px;
    border: 1px solid #cccccc;
    background-color: #ffffff;
    color: #333333;
    appearance: none;
    box-sizing: border-box;
}

.modal-content label {
    display: block;
    margin-bottom: 5px;
    font-size: 12px;
    color: #666666;
}

.modal-actions {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

.modal-actions button {
    padding: 8px 15px;
    margin: 0 5px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.modal-actions button:last-child {
    background-color: #f0f0f0;
    color: #333333;
    border: 1px solid #cccccc;
    border-radius: 4px;
    cursor: pointer;
    width: auto;
    font-size: 14px;
}

.modal-actions button:first-child {
    background-color: #4caf50; /* Green for Add */
    color: white;
}

.close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    color: #666666;
    font-size: 20px;
    cursor: pointer;
    padding: 0;
    line-height: 1;
}

.close-btn:hover {
    color: #333333;
}
</style>