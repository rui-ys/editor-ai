import { Editor } from '@tiptap/core';

// AI 消息接口
export interface AiMessage {
  role: string;
  content: string;
  status: number; // 1: 流式响应中, 2: 响应结束
  index?: number;
}

// AI 消息监听器
export interface AiMessageListener {
  onStart: () => void;
  onMessage: (message: AiMessage) => void;
  onStop: () => void;
}

// AI 模型配置接口
export interface AiModelConfig {
  apiKey?: string;
  endpoint?: string;
  temperature?: number;
  maxTokens?: number;
  [key: string]: any;
}

// AI 服务类
export class AiService {
  private editor: Editor;
  private modelConfig: AiModelConfig;
  
  constructor(editor: Editor, modelConfig: AiModelConfig) {
    this.editor = editor;
    this.modelConfig = modelConfig;
  }
  
  // 使用 OpenAI API 进行对话
  async chatWithOpenAI(prompt: string, listener: AiMessageListener): Promise<void> {
    try {
      listener.onStart();
      
      const response = await fetch(this.modelConfig.endpoint || 'https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.modelConfig.apiKey}`
        },
        body: JSON.stringify({
          model: this.modelConfig.model || 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: this.modelConfig.temperature || 0.7,
          max_tokens: this.modelConfig.maxTokens || 2000,
          stream: true
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is null');
      }
      
      const decoder = new TextDecoder();
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.substring(6));
              if (data.choices && data.choices.length > 0) {
                const choice = data.choices[0];
                listener.onMessage({
                  role: 'assistant',
                  content: choice.delta?.content || '',
                  status: choice.finish_reason === 'stop' ? 2 : 1,
                  index: choice.index
                });
              }
            } catch (e) {
              console.error('Error parsing SSE message:', e);
            }
          }
        }
      }
      
      listener.onStop();
    } catch (error) {
      console.error('Error in AI chat:', error);
      listener.onStop();
    }
  }
  
  // 使用文心一言 API 进行对话
  async chatWithWenXin(prompt: string, listener: AiMessageListener): Promise<void> {
    // 实现文心一言 API 的调用逻辑
    // 类似于 OpenAI 的实现，但需要根据文心一言的 API 规范调整
    console.log('文心一言 API 调用待实现');
    listener.onStart();
    listener.onMessage({
      role: 'assistant',
      content: '文心一言 API 调用待实现',
      status: 2
    });
    listener.onStop();
  }
  
  // 使用讯飞星火 API 进行对话
  async chatWithSpark(prompt: string, listener: AiMessageListener): Promise<void> {
    // 实现讯飞星火 API 的调用逻辑
    // 需要处理 WebSocket 连接和消息解析
    console.log('讯飞星火 API 调用待实现');
    listener.onStart();
    listener.onMessage({
      role: 'assistant',
      content: '讯飞星火 API 调用待实现',
      status: 2
    });
    listener.onStop();
  }
}