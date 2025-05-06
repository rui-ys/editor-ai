export interface AiModel {
  id: string; // Unique identifier for the model
  name: string; // Display name
  provider: string; // e.g., 'openai', 'anthropic', 'google', 'deepseek', 'custom'
  isNew?: boolean; // Optional flag for 'New' badge
  icon?: string; // Optional icon identifier (could be class name or path)
}

export const builtInModels: AiModel[] = [
  { id: 'claude-3.5-sonnet', name: 'Claude-3.5-Sonnet', provider: 'anthropic', icon: 'anthropic-icon' },
  { id: 'claude-3.7-sonnet', name: 'Claude-3.7-Sonnet', provider: 'anthropic', icon: 'anthropic-icon' }, // Assuming 3.7 exists or will soon
  { id: 'gemini-2.5-pro', name: 'Gemini-2.5-Pro', provider: 'google', isNew: true, icon: 'gemini-icon' }, // Assuming 2.5 exists or will soon
  { id: 'gpt-4.1', name: 'GPT-4.1', provider: 'openai', isNew: true, icon: 'openai-icon' }, // Assuming 4.1 exists or will soon
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', icon: 'openai-icon' },
  { id: 'deepseek-v3-0324', name: 'DeepSeek-V3-0324', provider: 'deepseek', icon: 'deepseek-icon' },
  { id: 'deepseek-v3', name: 'DeepSeek-V3', provider: 'deepseek', icon: 'deepseek-icon' },
  { id: 'deepseek-reasoner-r1', name: 'DeepSeek-Reasoner (R1)', provider: 'deepseek', icon: 'deepseek-icon' },
];

// Function to load custom models (e.g., from localStorage)
export const loadCustomModels = (): AiModel[] => {
  const storedModels = localStorage.getItem('customAiModels');
  try {
    return storedModels ? JSON.parse(storedModels) : [];
  } catch (error) {
    console.error("Failed to load custom models:", error);
    return [];
  }
};

// Function to save custom models
export const saveCustomModels = (models: AiModel[]) => {
  try {
    localStorage.setItem('customAiModels', JSON.stringify(models));
  } catch (error) {
    console.error("Failed to save custom models:", error);
  }
};