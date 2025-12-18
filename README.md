# Sound Mixer App

一个基于 Web 的音频混合工具，支持多轨道音频播放、音量调节和简单的音频效果处理。

## 功能特性

- **多轨道音频播放**：支持同时加载和播放多个音频文件。
- **音量调节**：每个音轨独立控制音量大小。
- **简单音频效果**：支持淡入淡出、循环播放等基本效果。
- **响应式设计**：适配不同屏幕尺寸的设备。

## 技术栈

- **前端**：Vue 3 + Composition API
- **样式**：CSS3 + Flexbox/Grid
- **音频处理**：Web Audio API
- **构建工具**：Vite

## 快速开始

### 安装依赖

确保已安装 [Node.js](https://nodejs.org/)（建议版本 16+），然后运行以下命令：

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

打开浏览器访问 `http://localhost:3000`。

### 构建生产版本

```bash
npm run build
```

构建后的文件会生成在 `dist` 目录中。

## 项目结构

```
sound-mixer-app/
├── public/              # 静态资源
├── src/
│   ├── assets/          # 图片、字体等资源
│   ├── components/      # Vue 组件
│   ├── composables/     # Composition API 逻辑
│   ├── App.vue          # 根组件
│   └── main.js          # 入口文件
├── vite.config.js       # Vite 配置
└── package.json         # 项目依赖和脚本
```

## 如何贡献

1. Fork 项目并克隆到本地。
2. 创建新分支：`git checkout -b feature/your-feature`。
3. 提交更改：`git commit -m "Add your feature"`。
4. 推送到远程分支：`git push origin feature/your-feature`。
5. 提交 Pull Request。

## 许可证

本项目采用 [MIT 许可证](LICENSE)。