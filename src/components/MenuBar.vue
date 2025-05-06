<template>
    <div
        v-if="editor"
        class="container"
    >
        <div class="control-group">
            <div class="button-group">
                <button
                    @click="editor.chain().focus().toggleBold().run()"
                    :disabled="!editor.can().chain().focus().toggleBold().run()"
                    :class="{ 'is-active': editor.isActive('bold') }"
                >
                    Bold
                </button>
                <button
                    @click="editor.chain().focus().toggleItalic().run()"
                    :disabled="!editor.can().chain().focus().toggleItalic().run()"
                    :class="{ 'is-active': editor.isActive('italic') }"
                >
                    Italic
                </button>
                <button
                    @click="editor.chain().focus().toggleStrike().run()"
                    :disabled="!editor.can().chain().focus().toggleStrike().run()"
                    :class="{ 'is-active': editor.isActive('strike') }"
                >
                    Strike
                </button>
                <button
                    @click="editor.chain().focus().toggleCode().run()"
                    :disabled="!editor.can().chain().focus().toggleCode().run()"
                    :class="{ 'is-active': editor.isActive('code') }"
                >
                    Code
                </button>
                <button @click="editor.chain().focus().unsetAllMarks().run()">
                    Clear marks
                </button>
                <button @click="editor.chain().focus().clearNodes().run()">
                    Clear nodes
                </button>
                <button
                    @click="editor.chain().focus().setParagraph().run()"
                    :class="{ 'is-active': editor.isActive('paragraph') }"
                >
                    Paragraph
                </button>
                <button
                    @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
                    :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
                >
                    H1
                </button>
                <button
                    @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
                    :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
                >
                    H2
                </button>
                <button
                    @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
                    :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
                >
                    H3
                </button>
                <button
                    @click="editor.chain().focus().toggleHeading({ level: 4 }).run()"
                    :class="{ 'is-active': editor.isActive('heading', { level: 4 }) }"
                >
                    H4
                </button>
                <button
                    @click="editor.chain().focus().toggleHeading({ level: 5 }).run()"
                    :class="{ 'is-active': editor.isActive('heading', { level: 5 }) }"
                >
                    H5
                </button>
                <button
                    @click="editor.chain().focus().toggleHeading({ level: 6 }).run()"
                    :class="{ 'is-active': editor.isActive('heading', { level: 6 }) }"
                >
                    H6
                </button>
                <button
                    @click="editor.chain().focus().toggleBulletList().run()"
                    :class="{ 'is-active': editor.isActive('bulletList') }"
                >
                    Bullet list
                </button>
                <button
                    @click="editor.chain().focus().toggleOrderedList().run()"
                    :class="{ 'is-active': editor.isActive('orderedList') }"
                >
                    Ordered list
                </button>
                <button
                    @click="editor.chain().focus().toggleCodeBlock().run()"
                    :class="{ 'is-active': editor.isActive('codeBlock') }"
                >
                    Code block
                </button>
                <button
                    @click="editor.chain().focus().toggleBlockquote().run()"
                    :class="{ 'is-active': editor.isActive('blockquote') }"
                >
                    Blockquote
                </button>
                <button @click="editor.chain().focus().setHorizontalRule().run()">
                    Horizontal rule
                </button>
                <button @click="editor.chain().focus().setHardBreak().run()">
                    Hard break
                </button>
                <button
                    @click="editor.chain().focus().undo().run()"
                    :disabled="!editor.can().chain().focus().undo().run()"
                >
                    Undo
                </button>
                <button
                    @click="editor.chain().focus().redo().run()"
                    :disabled="!editor.can().chain().focus().redo().run()"
                >
                    Redo
                </button>
                <button
                    @click="editor.chain().focus().setColor('#958DF1').run()"
                    :class="{ 'is-active': editor.isActive('textStyle', { color: '#958DF1' }) }"
                >
                    Purple
                </button>
            </div>
        </div>
        <ai-menu
            v-if="editor"
            :editor="editor"
        />

        <editor-content :editor="editor" />
    </div>
</template>

<script>
import { Color } from '@tiptap/extension-color'
import ListItem from '@tiptap/extension-list-item'
import TextStyle from '@tiptap/extension-text-style'
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent, Extension } from '@tiptap/vue-3'
import { ref } from 'vue'
import AiMenu from './AiMenu.vue';
import { AiExtension } from '../extensions/AiExtension';
import { aiConfig, getCurrentModel } from '../config/aiConfig';


export default {
    components: {
        EditorContent,
        aiMenu: AiMenu
    },

    data () {
        return {
            editor: null,
            showModelDropdown: false,
            currentModel: { id: 'gemini-2.5-pro', name: 'Gemini-2.5-Pro' },
            availableModels: [
                { id: 'gemini-2.5-pro', name: 'Gemini-2.5-Pro' },
                { id: 'gpt-4', name: 'GPT-4' },
                { id: 'gpt-3.5-turbo', name: 'GPT-3.5-Turbo' },
                { id: 'ernie-bot', name: 'ERNIE Bot' },
                { id: 'spark-desk', name: 'Spark Desk' }
            ],
            isProcessing: false
        }
    },

    methods: {
        // 定义AI续写函数
        async triggerAiCompletion() {
            if (!this.editor) return false;
            
            const { state } = this.editor;
            const { selection } = state;
            const { from } = selection;
            
            // 获取光标前的文本作为上下文
            const textBefore = state.doc.textBetween(Math.max(0, from - 500), from);
            if (!textBefore.trim()) return false; // 如果没有文本，不触发AI
            
            // 设置加载状态
            this.isProcessing = true;
            
            try {
                // 获取当前选中的模型和配置
                const currentModel = getCurrentModel();
                if (!currentModel) {
                    console.error("未选择AI模型");
                    this.isProcessing = false;
                    return false;
                }
                
                // 使用编辑器的improveWriting命令触发AI续写
                const tempMarker = "[AI续写中...]";
                this.editor.chain().focus().insertContentAt(from, tempMarker).run();
                
                // 使用编辑器命令触发AI请求
                this.editor.commands.improveWriting();
                
                return true;
            } catch (error) {
                console.error("AI续写错误:", error);
                this.isProcessing = false;
                return false;
            }
        }
    },
    
    mounted () {
        this.editor = new Editor({
            extensions: [
                Color.configure({ types: [TextStyle.name, ListItem.name] }),
                TextStyle.configure({ types: [ListItem.name] }),
                StarterKit,
                AiExtension.configure({
                    openai: aiConfig.openai,
                    wenxin: aiConfig.wenxin,
                    spark: aiConfig.spark,
                }),
                // 添加键盘事件处理
                Extension.create({
                    name: 'aiKeyboardTrigger',
                    addOptions() {
                        return {
                            triggerAiCompletion: null,
                        };
                    },
                    addKeyboardShortcuts() {
                        return {
                            'Tab': () => {
                                if (this.options.triggerAiCompletion) {
                                    this.options.triggerAiCompletion();
                                }
                                return true;
                            },
                            'Space': ({ editor }) => {
                                const { state } = editor;
                                const { selection } = state;
                                const { from } = selection;
                                const textBefore = state.doc.textBetween(Math.max(0, from - 50), from);
                                if (/[.!?。！？]\s*$/.test(textBefore.trim())) {
                                    editor.commands.insertContent(' ');
                                    if (this.options.triggerAiCompletion) {
                                        this.options.triggerAiCompletion();
                                    }
                                    return true;
                                }
                                return false;
                            },
                        };
                    },
                }).configure({
                    triggerAiCompletion: this.triggerAiCompletion,
                }),
            ],
            content: `
          <h2>
            Hi there,
          </h2>
          <p>
            this is a <em>basic</em> example of <strong>Tiptap</strong>. Sure, there are all kind of basic text styles you'd probably expect from a text editor. But wait until you see the lists:
          </p>
          <ul>
            <li>
              That's a bullet list with one …
            </li>
            <li>
              … or two list items.
            </li>
          </ul>
          <p>
            Isn't that great? And all of that is editable. But wait, there's more. Let's try a code block:
          </p>
          <pre><code class="language-css">body {
    display: none;
  }</code></pre>
          <p>
            I know, I know, this is impressive. It's only the tip of the iceberg though. Give it a try and click a little bit around. Don't forget to check the other examples too.
          </p>
          <blockquote>
            Wow, that's amazing. Good work, boy! 👏
            <br />
            — Mom
          </blockquote>
        `,
        })
    },

    beforeUnmount () {
        this.editor.destroy()
    },

    methods: {
        toggleModelDropdown () {
            this.showModelDropdown = !this.showModelDropdown
        },

        selectModel (model) {
            this.currentModel = model
            this.showModelDropdown = false
            console.log(`已选择模型: ${model.name}`)
        },

        applyAiAction (action, param) {
            if (this.isProcessing) {
                console.log('AI处理中，请稍候...')
                return
            }

            this.isProcessing = true
            const selection = this.editor.state.selection
            const selectedText = selection.content().content.textBetween(0, selection.content().size, ' ')

            if (!selectedText || selectedText.trim() === '') {
                console.log('请先选择文本')
                this.isProcessing = false
                return
            }

            console.log(`执行AI操作: ${action}`, param ? `参数: ${param}` : '')
            console.log(`使用模型: ${this.currentModel.name}`)
            console.log(`选中文本: ${selectedText}`)

            // 模拟AI处理
            setTimeout(() => {
                let result = ''

                switch (action) {
                    case 'polish':
                        result = `${selectedText} (已润色)`
                        break
                    case 'summarize':
                        result = `${selectedText.substring(0, selectedText.length / 3)}... (已总结)`
                        break
                    case 'translate':
                        result = `${selectedText} (已翻译为${param === 'en' ? '英文' : param})`
                        break
                    case 'grammar':
                        result = `${selectedText} (已修正语法)`
                        break
                    default:
                        result = selectedText
                }

                // 替换选中内容
                this.editor.chain().focus().deleteSelection().insertContent(result).run()
                this.isProcessing = false
            }, 1000)
        }
    }
}
</script>

<style lang="less">
/* Basic editor styles */
.tiptap {
    :first-child {
        margin-top: 0;
    }

    /* List styles */
    ul,
    ol {
        padding: 0 1rem;
        margin: 1.25rem 1rem 1.25rem 0.4rem;

        li p {
            margin-top: 0.25em;
            margin-bottom: 0.25em;
        }
    }

    /* Heading styles */
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
        line-height: 1.1;
        margin-top: 2.5rem;
        text-wrap: pretty;
    }

    h1,
    h2 {
        margin-top: 3.5rem;
        margin-bottom: 1.5rem;
    }

    h1 {
        font-size: 1.4rem;
    }

    h2 {
        font-size: 1.2rem;
    }

    h3 {
        font-size: 1.1rem;
    }

    h4,
    h5,
    h6 {
        font-size: 1rem;
    }

    /* Code and preformatted text styles */
    code {
        background-color: var(--purple-light);
        border-radius: 0.4rem;
        color: var(--black);
        font-size: 0.85rem;
        padding: 0.25em 0.3em;
    }

    pre {
        background: var(--black);
        border-radius: 0.5rem;
        color: var(--white);
        font-family: 'JetBrainsMono', monospace;
        margin: 1.5rem 0;
        padding: 0.75rem 1rem;

        code {
            background: none;
            color: inherit;
            font-size: 0.8rem;
            padding: 0;
        }
    }

    blockquote {
        border-left: 3px solid var(--gray-3);
        margin: 1.5rem 0;
        padding-left: 1rem;
    }

    hr {
        border: none;
        border-top: 1px solid var(--gray-2);
        margin: 2rem 0;
    }
}

/* 添加按钮组样式 */
.button-group {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 10px;
    background-color: #f5f7fa;
    border-radius: 6px;

    button {
        padding: 6px 12px;
        border: 1px solid #cbd5e1;
        background-color: #ffffff;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.875rem;
        color: #334155;
        font-weight: 500;
        transition: all 0.2s ease;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

        &:hover {
            background-color: #f1f5f9;
            border-color: #94a3b8;
            color: #1e293b;
        }

        &.is-active {
            background-color: #dbeafe;
            border-color: #60a5fa;
            color: #1d4ed8;
            font-weight: 600;
        }

        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            background-color: #f1f5f9;
        }
    }
}

/* AI菜单容器样式 */
.ai-menu-container {
    margin: 12px 0;
    padding: 10px;
    background-color: #f8fafc;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
}

/* AI菜单按钮组样式 */
.ai-menu-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
}

/* AI按钮样式 */
.ai-button {
    padding: 6px 14px;
    border: 1px solid #e2e8f0;
    background-color: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
    color: #475569;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background-color: #f1f5f9;
        border-color: #cbd5e1;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
}

/* AI模型选择器样式 */
.ai-model-selector {
    position: relative;
    margin-left: auto;
}

/* AI模型按钮特殊样式 */
.ai-button-model {
    background-color: #f0f9ff;
    border-color: #bae6fd;
    color: #0369a1;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6px;

    &:hover {
        background-color: #e0f2fe;
        border-color: #7dd3fc;
    }

    .ai-model-icon {
        color: #0ea5e9;
        font-size: 1rem;
    }

    .ai-dropdown-icon {
        font-size: 0.7rem;
        margin-left: 4px;
    }
}

/* 模型下拉菜单样式 */
.ai-model-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 4px;
    background-color: white;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    z-index: 10;
    min-width: 180px;
}

/* 模型选项样式 */
.ai-model-option {
    padding: 8px 12px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background-color: #f1f5f9;
    }

    &.is-active {
        background-color: #e0f2fe;
        color: #0369a1;
        font-weight: 500;
    }
}

/* 控制组容器样式 */
.control-group {
    margin-bottom: 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    overflow: hidden;
}

/* 容器样式 */
.container {
    max-width: 100%;
    margin: 0 auto;
    padding: 1rem;
}

/* 处理中状态样式 */
.ai-processing {
    opacity: 0.7;
    pointer-events: none;
}
</style>