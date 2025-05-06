import { Extension, Range } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { aiConfig, getCurrentModel, getModelById } from '../config/aiConfig'; // Import necessary config functions
import type { AiModel } from '../config/aiModels'; // Import AiModel type

export interface AiExtensionOptions {
  openai?: AiModelConfig;
  wenxin?: AiModelConfig;
  spark?: AiModelConfig;
  defaultModel?: string;
}

interface AiExtensionOptions {
  openai: { apiKey: string; baseUrl?: string };
  wenxin: { apiKey: string; secretKey: string };
  spark: { appId: string; apiKey: string; apiSecret: string };
  // Remove defaultModel from options if it's now fully dynamic
  // defaultModel: string;
}

// Helper function to get API configuration based on the selected model
const getProviderConfig = (model: AiModel | undefined) => {
    if (!model) return null;

    switch (model.provider) {
        case 'openai':
            return { type: 'openai', ...aiConfig.openai };
        case 'wenxin':
            return { type: 'wenxin', ...aiConfig.wenxin };
        case 'spark':
            return { type: 'spark', ...aiConfig.spark };
        case 'anthropic': // Add Anthropic config if needed
             // Example: return { type: 'anthropic', apiKey: aiConfig.anthropic.apiKey };
             console.warn("Anthropic provider configuration not implemented yet.");
             return null; // Placeholder
        case 'google': // Add Google config if needed
             // Example: return { type: 'google', apiKey: aiConfig.google.apiKey };
             console.warn("Google Gemini provider configuration not implemented yet.");
             return null; // Placeholder
        case 'deepseek': // Add DeepSeek config if needed
             // Example: return { type: 'deepseek', apiKey: aiConfig.deepseek.apiKey };
             console.warn("DeepSeek provider configuration not implemented yet.");
             return null; // Placeholder
        case 'custom':
            // For custom models, you might need more info stored in the AiModel object
            // e.g., model.apiUrl, model.apiKeyName (to fetch from secure storage)
            console.warn(`Custom model provider configuration for "${model.name}" not implemented yet.`);
            return null; // Placeholder
        default:
            console.error(`Unknown AI provider: ${model.provider}`);
            return null;
    }
};


async function callAIAPI(prompt: string, action: string, text: string, targetLang?: string): Promise<string> {
  console.log(`AI Action: ${action}, Text: "${text}"`);

  const currentModel = getCurrentModel(); // Get the currently selected model object
  if (!currentModel) {
      console.error("No AI model selected.");
      return "错误：未选择 AI 模型。";
  }

  const providerConfig = getProviderConfig(currentModel); // Get config for the selected model's provider
  if (!providerConfig) {
      console.error(`Configuration not found or implemented for provider: ${currentModel.provider}`);
      return `错误：模型 "${currentModel.name}" 的提供商配置未实现。`;
  }

  console.log(`Using Model: ${currentModel.name} (ID: ${currentModel.id}, Provider: ${currentModel.provider})`);

  // --- Adapt API call logic based on providerConfig.type ---
  // Example structure:
  try {
      let responseText = '';
      if (providerConfig.type === 'openai') {
          // --- OpenAI API Call Logic ---
          if (!providerConfig.apiKey) return "错误：OpenAI API Key 未配置。";
          const apiUrl = providerConfig.baseUrl || 'https://api.openai.com/v1/chat/completions';
          const response = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${providerConfig.apiKey}`,
              },
              body: JSON.stringify({
                  // Use the specific model ID selected by the user
                  model: currentModel.id, // e.g., 'gpt-4o', 'gpt-4.1'
                  messages: [{ role: 'user', content: `${prompt}\n\n${text}` }],
                  // Add other parameters like temperature, max_tokens if needed
              }),
          });
          if (!response.ok) {
              throw new Error(`OpenAI API error: ${response.statusText}`);
          }
          const data = await response.json();
          responseText = data.choices[0]?.message?.content?.trim() || '';

      } else if (providerConfig.type === 'wenxin') {
          // --- Wenxin API Call Logic ---
          console.warn("Wenxin API call not implemented yet.");
          // Implement Wenxin API call using providerConfig.apiKey, providerConfig.secretKey and currentModel.id
          responseText = `[文心一言响应 for ${currentModel.name}]`; // Placeholder

      } else if (providerConfig.type === 'spark') {
           // --- Spark API Call Logic ---
           console.warn("Spark API call not implemented yet.");
           // Implement Spark API call using providerConfig.appId, apiKey, apiSecret and currentModel.id (map to Spark's model names)
           responseText = `[讯飞星火响应 for ${currentModel.name}]`; // Placeholder

      } else if (providerConfig.type === 'anthropic') {
           // --- Anthropic API Call Logic ---
           console.warn("Anthropic API call not implemented yet.");
           // Implement Anthropic API call using its config and currentModel.id (e.g., 'claude-3.7-sonnet')
           responseText = `[Claude 响应 for ${currentModel.name}]`; // Placeholder

      } else if (providerConfig.type === 'google') {
           // --- Google Gemini API Call Logic ---
           console.warn("Google Gemini API call not implemented yet.");
            // Implement Gemini API call using its config and currentModel.id (e.g., 'gemini-2.5-pro')
           responseText = `[Gemini 响应 for ${currentModel.name}]`; // Placeholder

      } else if (providerConfig.type === 'deepseek') {
           // --- DeepSeek API Call Logic ---
           console.warn("DeepSeek API call not implemented yet.");
           // Implement DeepSeek API call using its config and currentModel.id
           responseText = `[DeepSeek 响应 for ${currentModel.name}]`; // Placeholder

      } else if (providerConfig.type === 'custom') {
           // --- Custom Model API Call Logic ---
           console.warn(`Custom model API call for "${currentModel.name}" not implemented yet.`);
           // Implement logic based on custom model properties (e.g., API endpoint)
           responseText = `[自定义模型响应 for ${currentModel.name}]`; // Placeholder
      } else {
          throw new Error(`Unsupported provider type: ${providerConfig.type}`);
      }

      console.log('AI Response:', responseText);
      return responseText || "[无响应]";

  } catch (error) {
      console.error('AI API Call Error:', error);
      return `AI 请求失败: ${error instanceof Error ? error.message : String(error)}`;
  }
}


export const AiExtension = Extension.create<AiExtensionOptions>({
  name: 'aiExtension',

  // Remove defaultModel from default options
  addOptions() {
    return {
      openai: { apiKey: '', baseUrl: undefined },
      wenxin: { apiKey: '', secretKey: '' },
      spark: { appId: '', apiKey: '', apiSecret: '' },
      // defaultModel: 'gpt-3.5-turbo', // Remove or keep as ultimate fallback
    };
  },

  // --- (保持 addCommands 不变, 它们内部调用 callAIAPI) ---
   addCommands() {
    return {
      improveWriting: () => ({ editor, commands }) => {
        // ... (保持命令实现不变, callAIAPI 会自动使用当前模型)
        const { from, to } = editor.state.selection;
        const text = editor.state.doc.textBetween(from, to);
        if (!text) return false;

        commands.setMeta('aiAction', { type: 'loading', from, to }); // Indicate loading

        callAIAPI("请润色以下文本：", 'improveWriting', text)
          .then(result => {
            editor.chain().focus().deleteRange({ from, to }).insertContentAt(from, result).run();
            commands.setMeta('aiAction', null); // Clear loading state
          })
          .catch(error => {
            console.error("Improve writing error:", error);
            commands.setMeta('aiAction', { type: 'error', from, to, message: String(error) });
          });
        return true;

      },
      summarizeText: () => ({ editor, commands }) => {
        // ... (保持命令实现不变)
        const { from, to } = editor.state.selection;
        const text = editor.state.doc.textBetween(from, to);
        if (!text) return false;
        commands.setMeta('aiAction', { type: 'loading', from, to });
        callAIAPI("请总结以下文本：", 'summarizeText', text)
          .then(result => {
             // Insert summary after the selection
             editor.chain().focus().insertContentAt(to + 1, `<p><strong>总结:</strong> ${result}</p>`).run();
             commands.setMeta('aiAction', null);
          })
          .catch(error => {
            console.error("Summarize text error:", error);
            commands.setMeta('aiAction', { type: 'error', from, to, message: String(error) });
          });
        return true;
      },
      translateText: (options: { targetLang: string }) => ({ editor, commands }) => {
         // ... (保持命令实现不变)
        const { from, to } = editor.state.selection;
        const text = editor.state.doc.textBetween(from, to);
        if (!text) return false;
        commands.setMeta('aiAction', { type: 'loading', from, to });
        callAIAPI(`请将以下文本翻译成${options.targetLang === 'en' ? '英语' : '中文'}：`, 'translateText', text, options.targetLang)
          .then(result => {
            editor.chain().focus().deleteRange({ from, to }).insertContentAt(from, result).run();
            commands.setMeta('aiAction', null);
          })
          .catch(error => {
            console.error("Translate text error:", error);
            commands.setMeta('aiAction', { type: 'error', from, to, message: String(error) });
          });
        return true;
      },
      fixGrammar: () => ({ editor, commands }) => {
         // ... (保持命令实现不变)
        const { from, to } = editor.state.selection;
        const text = editor.state.doc.textBetween(from, to);
        if (!text) return false;
        commands.setMeta('aiAction', { type: 'loading', from, to });
        callAIAPI("请修正以下文本的语法和拼写错误：", 'fixGrammar', text)
          .then(result => {
            editor.chain().focus().deleteRange({ from, to }).insertContentAt(from, result).run();
            commands.setMeta('aiAction', null);
          })
          .catch(error => {
            console.error("Fix grammar error:", error);
            commands.setMeta('aiAction', { type: 'error', from, to, message: String(error) });
          });
        return true;
      },
    };
  },


  // --- (保持 addProseMirrorPlugins 不变, 用于处理加载/错误状态的视觉反馈) ---
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('aiActionStatus'),
        state: {
          init() { return DecorationSet.empty; },
          apply(tr, set) {
            // Adjust decoration positions based on transaction steps
            set = set.map(tr.mapping, tr.doc);
            // See if the transaction has meta specifying AI action status
            const action = tr.getMeta('aiAction');
            if (action) {
              if (action.type === 'loading') {
                const deco = Decoration.inline(action.from, action.to, { class: 'ai-loading' });
                set = DecorationSet.create(tr.doc, [deco]);
              } else if (action.type === 'error') {
                 const deco = Decoration.inline(action.from, action.to, { class: 'ai-error', title: action.message });
                 set = DecorationSet.create(tr.doc, [deco]);
                 // Optionally clear error after a delay or next edit
              } else {
                // Clear decorations if action is null or unknown type
                set = DecorationSet.empty;
              }
            }
            return set;
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});