const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/pages/PaperCheck.tsx',
  'src/pages/PaperReduction.tsx',
  'src/pages/SmartAIReduction.tsx',
  'src/pages/AITutorSimulation.tsx',
  'src/pages/FormatStandardization.tsx'
];

const replacements = {
  // String closure fixes
  "'开题报告, icon": "'开题报告', icon",
  "'AIGC检测, icon": "'AIGC检测', icon",

  // JSX fixes
  "智研助手/span>": "智研助手</span>",
  "你好，同学/h2>": "你好，同学</h2>",
  "提供修改建议�?/p>": "提供修改建议。</p>",
  "计费方式：/span>按字符计费/p>": "计费方式：</span>按字符计费</p>",
  "单价标准：/span>2元/千字</p>": "单价标准：</span>2元/千字</p>",
  "初稿查重：/span>首次注册用户可有1次免费机会/p>": "初稿查重：</span>首次注册用户可有1次免费机会</p>",
  "论文原则性检测/h2>": "论文原则性检测</h2>",
  "修改建议。/p>": "修改建议。</p>",
  "点击或将文件拖拽到这里上传/p>": "点击或将文件拖拽到这里上传</p>",
  "已输入{wordCount}字/span>": "已输入{wordCount}字</span>",
  "开始检测/span>": "开始检测</span>",

  // Comment fixes
  "包含论文上传和检测功�? */": "包含论文上传和检测功能 */",
  "PaperCheck页面主函数组�? * @returns": "PaperCheck页面主函数组件\n * @returns",
  "左侧侧边�?*/": "左侧侧边栏 */",
  "主内容区�?*/": "主内容区域 */",
  "右侧搜索和设�?*/": "右侧搜索和设置 */",
  "问候区�?*/": "问候区域 */",
  "字数统计和检测按钮*/": "字数统计和检测按钮 */",

  // PaperReduction fixes
  "智能降重页面主函数组�?": "智能降重页面主函数组件",
  "包含文本降重和文件上传功�?": "包含文本降重和文件上传功能",
  "字数统计和降重按钮*/": "字数统计和降重按钮 */",
  "提升论文的人类撰写感�?/p>": "提升论文的人类撰写感。</p>",
  "开始降重}/span>": "开始降重</span>",
  "改写后的内容将按流式显示在这里/p>": "改写后的内容将按流式显示在这里</p>",
  "降低重复率�?)": "降低重复率。')",

  // SmartAIReduction fixes
  "智能降AI页面主函数组�?": "智能降AI页面主函数组件",
  "包含AI降重和文件上传功�?": "包含AI降重和文件上传功能",
  "降AI率工具/h2>": "降AI率工具</h2>",
  "句式结构�?)": "句式结构。')",
};

const baseDir = 'd:\\安装的软件\\TRAE\\Trae CN save';

filesToFix.forEach(file => {
  const filePath = path.join(baseDir, file);

  if (!fs.existsSync(filePath)) {
    console.log(`文件不存在: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  Object.entries(replacements).forEach(([search, replace]) => {
    if (content.includes(search)) {
      content = content.split(search).join(replace);
      modified = true;
      console.log(`  修复: ${search} -> ${replace}`);
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`已修复: ${file}`);
  } else {
    console.log(`无需修复: ${file}`);
  }
});

console.log('修复完成！');
