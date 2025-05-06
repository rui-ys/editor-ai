import { reactive } from 'vue';
import { builtInModels, loadCustomModels, saveCustomModels, AiModel } from './aiModels';

interface AiConfig {
  openai: {
    apiKey: string;
    baseUrl?: string;
  };
  wenxin: { // 示例：文心一言配置
    apiKey: string;
    secretKey: string;
  };
  spark: { // 示例：讯飞星火配置
    appId: string;
    apiKey: string;
    apiSecret: string;
  };
  // 可以添加其他模型的配置...
  models: {
    builtIn: AiModel[];
    custom: AiModel[];
    currentModelId: string | null;
  };
  defaultModel: string; // Keep this for initial default
}

// 从环境变量或安全存储中获取 API Keys
const config: AiConfig = reactive({
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    baseUrl: import.meta.env.VITE_OPENAI_BASE_URL || undefined,
  },
  wenxin: {
    apiKey: import.meta.env.VITE_WENXIN_API_KEY || '',
    secretKey: import.meta.env.VITE_WENXIN_SECRET_KEY || '',
  },
  spark: {
    appId: import.meta.env.VITE_SPARK_APP_ID || '',
    apiKey: import.meta.env.VITE_SPARK_API_KEY || '',
    apiSecret: import.meta.env.VITE_SPARK_API_SECRET || '',
  },
  deepseek: {
    apiKey: 'YOUR_DEEPSEEK_API_KEY', // 在这里或通过环境变量设置你的 API Key
    baseUrl: 'https://api.deepseek.com/v1', // 确认 DeepSeek 的基础 URL
  },
  models: {
    builtIn: builtInModels,
    custom: loadCustomModels(),
    currentModelId: localStorage.getItem('currentAiModelId') || 'claude-3.7-sonnet', // Default to Claude 3.7 based on image
  },
  // 初始默认模型，可以基于 currentModelId 设置，或者保持一个固定值
  defaultModel: localStorage.getItem('currentAiModelId') || 'claude-3.7-sonnet',
});

// Function to get all available models
export const getAllModels = (): AiModel[] => {
  return [...config.models.builtIn, ...config.models.custom];
};

// Function to get the currently selected model object
export const getCurrentModel = (): AiModel | undefined => {
  return getAllModels().find(model => model.id === config.models.currentModelId);
};

// Function to set the current model
export const setCurrentModel = (modelId: string) => {
  const modelExists = getAllModels().some(model => model.id === modelId);
  if (modelExists) {
    config.models.currentModelId = modelId;
    config.defaultModel = modelId; // Update defaultModel as well
    localStorage.setItem('currentAiModelId', modelId);
    console.log(`Current AI model set to: ${modelId}`);
  } else {
    console.warn(`Attempted to set non-existent model ID: ${modelId}`);
  }
};

// Function to add a custom model
export const addCustomModel = (model: Omit<AiModel, 'provider'>) => {
  const newModel: AiModel = { ...model, provider: 'custom' };
  // Basic validation (e.g., check for duplicate ID)
  if (getAllModels().some(m => m.id === newModel.id)) {
    console.error(`Model with ID ${newModel.id} already exists.`);
    // Optionally, provide feedback to the user
    return false;
  }
  config.models.custom.push(newModel);
  saveCustomModels(config.models.custom);
  console.log(`Custom model added: ${newModel.name}`);
  return true;
};

// Function to remove a custom model
export const removeCustomModel = (modelId: string) => {
  const index = config.models.custom.findIndex(m => m.id === modelId);
  if (index > -1) {
    config.models.custom.splice(index, 1);
    saveCustomModels(config.models.custom);
    console.log(`Custom model removed: ${modelId}`);
    // If the removed model was the current one, reset to a default
    if (config.models.currentModelId === modelId) {
      setCurrentModel(builtInModels[0]?.id || ''); // Reset to the first built-in or empty
    }
    return true;
  }
  console.warn(`Custom model with ID ${modelId} not found for removal.`);
  return false;
};


export { config as aiConfig };