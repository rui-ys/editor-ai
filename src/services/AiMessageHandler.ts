import { Editor } from '@tiptap/core';
import { AiMessage, AiMessageListener } from './AiService';
import MarkdownIt from 'markdown-it';

export class AiMessageHandler implements AiMessageListener {
  private editor: Editor;
  private from: number;
  private markdownParser: MarkdownIt;
  private parseMarkdown: boolean;
  
  constructor(editor: Editor, options?: { parseMarkdown?: boolean }) {
    this.editor = editor;
    this.from = editor.state.selection.from;
    this.parseMarkdown = options?.parseMarkdown ?? true;
    this.markdownParser = new MarkdownIt({
      html: true,
      breaks: true,
      linkify: true
    });
  }
  
  onStart(): void {
    // 可以在这里添加开始处理的逻辑，比如显示加载指示器
    console.log('AI 响应开始');
  }
  
  onMessage(message: AiMessage): void {
    // 将 AI 返回的内容插入到编辑器中
    const { state, view } = this.editor;
    const tr = state.tr.insertText(message.content);
    view.dispatch(tr);
    
    // 如果是最后一条消息，并且需要解析 Markdown
    if (message.status === 2 && this.parseMarkdown) {
      const end = this.editor.state.selection.to;
      const insertedText = this.editor.state.doc.textBetween(this.from, end);
      
      // 解析 Markdown 并替换原文本
      const html = this.markdownParser.render(insertedText);
      const tr = state.tr.deleteRange(this.from, end);
      
      // 使用 editor.commands API 插入 HTML
      this.editor.commands.insertContentAt(this.from, html);
    }
    
    // 滚动到视图
    this.editor.commands.scrollIntoView();
  }
  
  onStop(): void {
    // 可以在这里添加结束处理的逻辑，比如隐藏加载指示器
    console.log('AI 响应结束');
  }
}