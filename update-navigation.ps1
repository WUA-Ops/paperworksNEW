$files = @(
    'SmartOutline.tsx',
    'FormatStandardization.tsx',
    'VersionCompare.tsx',
    'AITutorSimulation.tsx',
    'AIThesisGenerator.tsx',
    'AIPPTGenerator.tsx',
    'AIGCDetectionUpload.tsx',
    'SmartAIReduction.tsx',
    'PaperCheck.tsx',
    'PaperReduction.tsx',
    'WritingAssistant.tsx',
    'AIGCDetection.tsx'
)

$newSidebarItems = @"
  const sidebarItems = [
    { id: 'topic', name: '选题灵感', icon: 'lightbulb', path: '/topic' },
    { id: 'proposal', name: '开题报告', icon: 'file-text', path: '/proposal' },
    { id: 'outline', name: '智能大纲', icon: 'list', path: '/outline' },
    { id: 'writing', name: '辅助写作', icon: 'pen-tool', path: '/assistant' },
    { id: 'format', name: '格式规范化', icon: 'layout', path: '/format' },
    { id: 'check', name: '论文查重', icon: 'search', path: '/check' },
    { id: 'reduction', name: '智能降重', icon: 'refresh-cw', path: '/reduction' },
    { id: 'aigc', name: 'AIGC检测', icon: 'shield', path: '/aigc' },
    { id: 'ai-reduction', name: '智能降AI', icon: 'cpu', path: '/ai-reduction' },
    { id: 'answer', name: 'AI生成答辩文稿', icon: 'file-text', path: '/answer' },
    { id: 'ppt', name: 'AI生成答辩PPT', icon: 'presentation', path: '/ppt' },
    { id: 'tutor', name: 'AI模拟导师', icon: 'user-circle', path: '/tutor' },
  ]
"@

foreach ($file in $files) {
    $filePath = Join-Path 'src\pages' $file
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        
        # 1. Add import
        if (-not $content.Contains('useNavigate')) {
            $content = $content -replace "import \{ useState \} from 'react'", "import { useState } from 'react'`r`nimport { useNavigate } from 'react-router-dom'"
        }
        
        # 2. Add navigate hook
        if (-not $content.Contains('const navigate = useNavigate()')) {
            $content = $content -replace 'function (\w+)\(\) \{', "function `$1() {`r`n  const navigate = useNavigate()"
        }
        
        # 3. Update sidebarItems
        if ($content.Contains("id: 'topic', name: '选题灵感', icon: 'lightbulb'") -and -not $content.Contains("path: '/topic'")) {
            $startIdx = $content.IndexOf('const sidebarItems = [')
            $endIdx = $content.IndexOf('  ];', $startIdx)
            if ($startIdx -ge 0 -and $endIdx -ge 0) {
                $content = $content.Substring(0, $startIdx) + $newSidebarItems + $content.Substring($endIdx + 4)
            }
        }
        
        # 4. Add onClick to button
        if (-not $content.Contains('onClick={() => navigate(item.path)}')) {
            $content = $content -replace '<button\s*\r?\n\s*key=\{item\.id\}', "<button`r`n              key={item.id}`r`n              onClick={() => navigate(item.path)}"
        }
        
        Set-Content $filePath $content -NoNewline
        Write-Host "Updated: $file"
    } else {
        Write-Host "File not found: $file"
    }
}
