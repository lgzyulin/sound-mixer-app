// check-build.js (新语法)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 由于 ES 模块中没有 __dirname，需要用以下方式模拟
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('检查Vue构建输出...')

const distPath = path.join(__dirname, 'dist')
const assetsPath = path.join(distPath, 'assets')
const indexPath = path.join(distPath, 'index.html')


// ... 你文件剩下的代码

// 检查dist文件夹
if (!fs.existsSync(distPath)) {
  console.error('❌ dist文件夹不存在')
  process.exit(1)
}

// 检查assets文件夹
if (!fs.existsSync(assetsPath)) {
  console.error('❌ assets文件夹不存在')
  // 列出dist内容
  console.log('dist文件夹内容:', fs.readdirSync(distPath))
  process.exit(1)
}

// 检查JS文件
const jsFiles = fs.readdirSync(assetsPath).filter(f => f.endsWith('.js'))
console.log('找到JS文件:', jsFiles)

jsFiles.forEach(file => {
  const filePath = path.join(assetsPath, file)
  const stats = fs.statSync(filePath)
  const content = fs.readFileSync(filePath, 'utf8')
  
  console.log(`\n=== 检查 ${file} ===`)
  console.log(`文件大小: ${(stats.size / 1024).toFixed(2)} KB`)
  console.log(`文件前200字符: ${content.substring(0, 200)}...`)
  
  // 检查是否包含Vue
  if (content.includes('createApp') || content.includes('vue')) {
    console.log('✅ 包含Vue相关代码')
  } else {
    console.log('⚠️  可能不包含Vue代码')
  }
  
  // 检查是否有语法错误
  try {
    // 简单检查括号匹配
    const openBrackets = (content.match(/\{/g) || []).length
    const closeBrackets = (content.match(/\}/g) || []).length
    console.log(`括号匹配: {${openBrackets}} }${closeBrackets}`)
    
    if (openBrackets !== closeBrackets) {
      console.error('❌ 括号不匹配！')
    }
  } catch (err) {
    console.error('❌ 检查文件时出错:', err.message)
  }
})

// 检查index.html
if (fs.existsSync(indexPath)) {
  const html = fs.readFileSync(indexPath, 'utf8')
  console.log('\n=== 检查 index.html ===')
  
  // 检查脚本标签
  const scriptTags = html.match(/<script[^>]*>/g) || []
  console.log(`脚本标签数量: ${scriptTags.length}`)
  scriptTags.forEach(tag => console.log(`  ${tag}`))
  
  // 检查是否包含type="module"
  const hasModule = html.includes('type="module"')
  console.log(`是否包含type="module": ${hasModule}`)
  
  if (hasModule) {
    console.log('⚠️  注意：HBuilderX可能不支持type="module"')
  }
}

console.log('\n✅ 构建检查完成')