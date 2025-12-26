<div align="center">

<img src="public/pickacg.svg" alt="PickACG Logo" width="100" height="100">

# PickACG

**基于 Bangumi API 的现代化 ACG 内容探索平台**

**简体中文** | [English](./README.en.md)

[![Vercel Status](https://img.shields.io/website?url=https%3A%2F%2Fpickacg.ezers.top&up_message=Online&up_color=55b467&down_message=Offline&down_color=ff5252&style=flat-square&logo=vercel&label=Vercel&labelColor=black&logoColor=white)](https://pickacg.ezers.top/)
[![License](https://img.shields.io/github/license/ezer015/pickacg?style=flat-square&labelColor=black&color=8ae8ff&logo=gnu&logoColor=white)](./LICENSE)

![Screenshot](./public/screenshot.png)

<a href="https://pickacg.ezers.top/">
    <img src="https://img.shields.io/badge/Try_Now-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Try Now" width="200">
</a>

</div>

## ✨ 主要特性

- 🔍 **智能标签系统**：基于搜索结果动态聚合标签，支持多标签组合过滤，精准定位兴趣点。
- 📊 **多维筛选机制**：支持按评分区间、放送日期、热度等进行深度筛选。
- 📱 **全平台适配**：基于响应式设计，完美适配桌面端与移动端，支持深色/浅色模式自动切换。
- 🔐 **个性化体验**：集成 Bangumi OAuth 2.0，登录后解锁更多内容。
- ⚡ **极致性能**：采用 Next.js App Router 与无限滚动加载技术，浏览体验丝滑。
- 🎨 **现代 UI**：使用 shadcn/ui 构建，界面简洁优雅。

## 🚀 快速开始

### 克隆仓库

```bash
git clone https://github.com/Ezer015/pickacg.git
cd pickacg
```

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 即可开始开发。

## 📦 构建部署

### 生产环境构建

```bash
pnpm build
pnpm start
```

### 部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Ezer015/pickacg)

## 🤝 参与贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建您的特性分支 `git checkout -b feature/amazing-feature`
3. 提交您的修改 `git commit -m 'feat: add some amazing feature'`
4. 推送到分支 `git push origin feature/amazing-feature`
5. 打开一个 Pull Request

## 📄 许可证

本项目基于 [GNU AGPL v3.0](./LICENSE) 开源许可证发布。

## 🙏 致谢

- [Bangumi API](https://github.com/bangumi/api)
