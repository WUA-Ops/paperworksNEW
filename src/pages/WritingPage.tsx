import React, { useState } from 'react';

// 定义一个章节的结构
interface Chapter {
  id: string;
  title: string;
  content: string;
}

const WritingPage: React.FC = () => {
  // 论文标题
  const [title, setTitle] = useState('我的毕业论文初稿');
  // 章节列表
  const [chapters, setChapters] = useState<Chapter[]>([
    { id: '1', title: '绪论', content: '这是绪论部分，请在这里撰写研究背景和意义……' },
    { id: '2', title: '相关技术', content: '介绍使用的技术和框架……' },
    { id: '3', title: '实验与分析', content: '描述实验过程和结果分析……' },
  ]);
  // 当前正在编辑的章节ID
  const [activeChapterId, setActiveChapterId] = useState('1');

  // 计算总字数（简单统计所有章节内容的字符数）
  const totalWordCount = chapters.reduce((sum, ch) => sum + ch.content.length, 0);

  // 更新当前章节的内容
  const updateCurrentContent = (newContent: string) => {
    setChapters(prev =>
      prev.map(ch =>
        ch.id === activeChapterId ? { ...ch, content: newContent } : ch
      )
    );
  };

  // 获取当前活跃的章节对象
  const activeChapter = chapters.find(ch => ch.id === activeChapterId) || chapters[0];

  return (
    <div className="writing-container" style={{ padding: '20px' }}>
      <div className="writing-header">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ fontSize: '24px', width: '100%', marginBottom: '20px' }}
        />
        <div>总字数：{totalWordCount} 字符</div>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        {/* 左侧章节列表 */}
        <div style={{ width: '200px', borderRight: '1px solid #ccc' }}>
          <h3>章节</h3>
          {chapters.map(ch => (
            <div
              key={ch.id}
              onClick={() => setActiveChapterId(ch.id)}
              style={{
                cursor: 'pointer',
                padding: '8px',
                background: activeChapterId === ch.id ? '#e6f7ff' : 'transparent',
                marginBottom: '4px',
              }}
            >
              {ch.title}
            </div>
          ))}
        </div>

        {/* 右侧编辑器 */}
        <div style={{ flex: 1 }}>
          <input
            type="text"
            value={activeChapter.title}
            onChange={(e) => {
              setChapters(prev =>
                prev.map(ch =>
                  ch.id === activeChapterId ? { ...ch, title: e.target.value } : ch
                )
              );
            }}
            style={{ fontSize: '20px', marginBottom: '10px', width: '100%' }}
          />
          <textarea
            value={activeChapter.content}
            onChange={(e) => updateCurrentContent(e.target.value)}
            rows={15}
            style={{ width: '100%', padding: '10px', fontSize: '16px' }}
          />
        </div>
      </div>
    </div>
  );
};

export default WritingPage;