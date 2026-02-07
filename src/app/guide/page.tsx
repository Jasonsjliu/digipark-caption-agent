'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Logo } from '@/components/Logo';
import Link from 'next/link';

// Ensure this page is treated as a dynamic route to prevent 404s on Vercel if static gen fails
export const dynamic = 'force-dynamic';

const guideContent = `
# 📘 Digipark Caption Agent - 操作手册 (User Guide)

本手册详细介绍了 Digipark AI 文案生成器的所有功能，帮助快速上手并充分利用高级功能。

---

## 🚀 快速开始 (Quick Start)

### 1. 核心界面概览
> *主界面使用了极简的 "胶囊" 设计风格，所有核心操作都集中在屏幕中央。*

- **话题输入框**: 输入想要生成文案的主题（例如："情人节双人购票送7D影院活动"）。
- **生成按钮 (✨)**: 点击开始生成。
- **批量设置 (Batch)**: 调整一次生成的数量。

### 2. 基础生成流程
1.  **输入话题**: 在顶部输入框中输入关键词或简短描述。
2.  **选择数量**: 使用 ➖ / ➕ 按钮调整生成的文案数量。
3.  **点击生成**: 按下 \`Enter\` 键或点击 ✨ 按钮。
4.  **查看结果**: 页面向下滑动，展示生成的文案卡片。

---

## 🎨 高级设置 (Advanced Settings)
点击胶囊栏右侧的设置按钮 ⚙️ (或在生成面板中直接调整) 可展开高级选项。

### 1. 模型选择 (AI Model)
选择驱动生成的 AI 大脑：
- **Gemini (默认)**: 速度快，创意丰富，适合大多数场景。
- **GPT-4o**: 逻辑性强，适合需要严谨结构的文案。
- **Grok**: 风格独特，偏向社交媒体属性内容。

### 2. 风格微调 (Style Tuning)
- **Creativity (创意度)** 🎨: 拖动滑块调整。
    - **低 (0-30%)**: 保守、准确、直接。
    - **中 (30-70%)**: 平衡。
    - **高 (70-100%)**: 发散、联想丰富、可能产生幻觉。
- **Intensity (强度/语气)** ⚡: 
    - **1-2**: 温和、平静。
    - **3**: 正常。
    - **4-5**: 强烈、激动、促销感强。

---

## 🧩 变量控制 (Variable Context) - **核心功能**

在 "Advanced Context" 区域，可以精细控制文案的各个维度（如语气、受众、视角）。

### 💡 核心逻辑：固定 vs 随机
我们引入了全新的 **"固定 (Pin)"** 和 **"禁用 (Disable)"** 机制，让在批量生成时拥有完美控制权。

| 图标 | 状态 | 描述 | 批量生成时的行为 (Batch Behavior) |
| :--- | :--- | :--- | :--- |
| 📌 | **Pinned (固定)** | **金色图钉** | **🔒 锁定值**: 无论怎么随机，该变量永远保持选择的值。 |
| ⚪ | **Active (启用)** | 默认状态 (无图标) | **🎲 参与随机**: 如果开启 "Randomize Variables"，该变量会每次随机变化。 |
| 🚫 | **Disabled (禁用)** | **灰色/禁用** | **跳过**: 该变量完全不参与生成，AI 不会收到此上下文。 |

### 操作演示
1.  **选择**: 点击任一标签（如 "Tone: Funny"）即可选中。
2.  **固定 (Pin)**: 
    - **右键点击** 选中的标签，或点击标签上的 📌 图标。
    - 状态变为 **金色**，表示该值已锁定。
3.  **禁用 (Disable)**: 
    - 点击类别标题右侧的 👁️ 图标。
    - 整个类别变灰，生成时将忽略此维度。

---

## 📦 批量生成 (Batch Generation)

当 **Batch Size > 1** 时，点击生成会弹出 **批量配置窗口**。

### 🎛️ 随机化选项 (Randomization Config)
您可以选择在批量生成中让哪些参数 **自动变化**，以获得多样化的结果。

- **Randomize Models**: 勾选后，系统会在 Gemini, GPT, Grok 等模型间随机切换。
- **Randomize Variables**: 勾选后，除了您 **固定 (Pin)** 的变量外，其他所有 **启用** 的变量都会随机填充。

---

## 📊 结果分析 (Results Analysis)

每张生成卡片都包含了详细的 "元数据"，帮助您复盘效果。

### 卡片结构
1.  **文案正文**: AI 生成的主要内容。
2.  **标签 (Tags)**: 针对平台优化的标签（如 TikTok 的热门标签）。
3.  **Active Context (生效变量)**: 
    - 显示该次生成具体使用了哪些变量（例如 "Tone: Witty", "Audience: Gen Z"）。
    - 方便您看出随机化的结果。
4.  **Keywords Used (关键词)**: 
    - 显示本次生成具体用到了哪些关键词。
5.  **底部信息栏**:
    - 🤖 **Model**: 使用的 AI 模型（如 \`gemini-3-flash\`）。
    - 🎨 **Creativity**: 当时的创意度设置。
    - ⚡ **Intensity**: 当时的语气强度。

---

## 🔒 数据隐私 (Privacy)
- **用户隔离**: 生成历史仅对自己可见 (基于 Supabase RLS 技术)。
- **历史记录**: 所有生成结果都会自动保存在云端，刷新页面后依然可见。（保留近七天数据）

---

## 🛠️ 常见问题 (FAQ)

**Q: 为什么生成的文案没有用到我选的变量？**
A: 检查该变量类别是否被 **禁用 (Disabled)** 了（标题旁边的眼睛图标是否有关闭斜杠）。

**Q: 想在批量生成中保持 "幽默" 的语气，但希望 "受众" 随机，怎么做？**
A: 
1. 选中 "Tone: Humor"。
2. **Pin (固定)** 它（点击变金）。
3. 保持 "Audience" 类别开启，但不 Pin 任何值。
4. 在批量弹窗中勾选 "Randomize Variables"。
5. **结果**: 所有文案语气都是幽默的，但受众会随机变化（如学生、上班族等）。

**Q: 文案生成失败显示 "Error"？**
A: 如果是批量生成中的个别失败（如 Grok 模型超时），系统会自动跳过该条，不影响其他结果。请检查网络或稍后重试。
`;

export default function GuidePage() {
    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-900/20 to-transparent" />
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-600/10 blur-[120px] rounded-full mix-blend-screen" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-cyan-600/10 blur-[100px] rounded-full mix-blend-screen" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
                {/* Header */}
                <header className="flex items-center justify-between mb-12">
                    <div className="hover:opacity-80 transition-opacity">
                        <Logo />
                    </div>
                    <Link
                        href="/"
                        className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                    >
                        <span>← Back to App</span>
                    </Link>
                </header>

                {/* Content Card */}
                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
                    <div className="prose prose-invert prose-lg max-w-none">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                // Custom styling for markdown elements
                                h1: ({ node, ...props }) => <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-8 pb-4 border-b border-white/10" {...props} />,
                                h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold text-white mt-10 mb-6 flex items-center gap-2" {...props} />,
                                h3: ({ node, ...props }) => <h3 className="text-lg font-medium text-indigo-200 mt-8 mb-4 border-l-4 border-indigo-500 pl-3" {...props} />,
                                p: ({ node, ...props }) => <p className="text-gray-300 leading-relaxed mb-4" {...props} />,
                                ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-6 mb-6 text-gray-300 space-y-2" {...props} />,
                                ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-6 mb-6 text-gray-300 space-y-2" {...props} />,
                                li: ({ node, ...props }) => <li className="pl-2" {...props} />,
                                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-cyan-500/50 bg-cyan-500/10 p-4 rounded-r-lg italic text-gray-300 my-6" {...props} />,
                                code: ({ node, ...props }) => <code className="bg-black/30 text-indigo-300 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />,
                                pre: ({ node, ...props }) => <pre className="bg-black/50 p-4 rounded-xl overflow-x-auto border border-white/10 my-6" {...props} />,
                                table: ({ node, ...props }) => <div className="overflow-x-auto my-8 border border-white/10 rounded-xl"><table className="w-full text-left border-collapse" {...props} /></div>,
                                th: ({ node, ...props }) => <th className="bg-white/10 p-4 font-semibold text-white border-b border-white/10 min-w-[120px]" {...props} />,
                                td: ({ node, ...props }) => <td className="p-4 border-b border-white/5 text-gray-300" {...props} />,
                                a: ({ node, ...props }) => <a className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 transition-colors" {...props} />,
                                hr: ({ node, ...props }) => <hr className="border-white/10 my-8" {...props} />,
                            }}
                        >
                            {guideContent}
                        </ReactMarkdown>
                    </div>

                    <div className="mt-16 pt-8 border-t border-white/10 text-center text-sm text-gray-500">
                        <p>Digipark Caption Agent v1.0 • Built with ❤️ for Creators</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
