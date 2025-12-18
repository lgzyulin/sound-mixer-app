// test-simple.js - 直接放在HBuilderX项目根目录
console.log('========= 测试JS文件已加载 =========')
console.log('时间:', new Date().toLocaleTimeString())

// 创建可见的测试内容
const testDiv = document.createElement('div')
testDiv.innerHTML = `
  <div style="
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #4CAF50, #2196F3);
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 20px;
    z-index: 99999;
  ">
    <h1 style="font-size: 24px; margin-bottom: 20px;">✅ 纯JS测试成功！</h1>
    <p>如果看到这个界面，说明JS能正常执行</p>
    <p>当前时间: <span id="time">${new Date().toLocaleTimeString()}</span></p>
    <button onclick="testClick()" style="
      padding: 12px 24px;
      background: white;
      color: #2196F3;
      border: none;
      border-radius: 5px;
      margin-top: 20px;
      font-size: 16px;
    ">点击测试</button>
  </div>
`

document.body.appendChild(testDiv)

// 更新时间的函数
setInterval(() => {
  const timeElement = document.getElementById('time')
  if (timeElement) {
    timeElement.textContent = new Date().toLocaleTimeString()
  }
}, 1000)

// 点击测试
window.testClick = function() {
  alert('按钮点击成功！')
}

console.log('========= 测试JS执行完成 =========')