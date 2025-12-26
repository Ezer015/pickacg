<div align="center">

<img src="public/pickacg.svg" alt="PickACG Logo" width="100" height="100">

# PickACG

**Modern ACG Content Discovery Platform Based on Bangumi API**

[简体中文](./README.md) | **English**

[![DeepWiki](https://img.shields.io/badge/DeepWiki-Ask-blue.svg?style=flat-square&labelColor=black&logoColor=white&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAyCAYAAAAnWDnqAAAAAXNSR0IArs4c6QAAA05JREFUaEPtmUtyEzEQhtWTQyQLHNak2AB7ZnyXZMEjXMGeK/AIi+QuHrMnbChYY7MIh8g01fJoopFb0uhhEqqcbWTp06/uv1saEDv4O3n3dV60RfP947Mm9/SQc0ICFQgzfc4CYZoTPAswgSJCCUJUnAAoRHOAUOcATwbmVLWdGoH//PB8mnKqScAhsD0kYP3j/Yt5LPQe2KvcXmGvRHcDnpxfL2zOYJ1mFwrryWTz0advv1Ut4CJgf5uhDuDj5eUcAUoahrdY/56ebRWeraTjMt/00Sh3UDtjgHtQNHwcRGOC98BJEAEymycmYcWwOprTgcB6VZ5JK5TAJ+fXGLBm3FDAmn6oPPjR4rKCAoJCal2eAiQp2x0vxTPB3ALO2CRkwmDy5WohzBDwSEFKRwPbknEggCPB/imwrycgxX2NzoMCHhPkDwqYMr9tRcP5qNrMZHkVnOjRMWwLCcr8ohBVb1OMjxLwGCvjTikrsBOiA6fNyCrm8V1rP93iVPpwaE+gO0SsWmPiXB+jikdf6SizrT5qKasx5j8ABbHpFTx+vFXp9EnYQmLx02h1QTTrl6eDqxLnGjporxl3NL3agEvXdT0WmEost648sQOYAeJS9Q7bfUVoMGnjo4AZdUMQku50McDcMWcBPvr0SzbTAFDfvJqwLzgxwATnCgnp4wDl6Aa+Ax283gghmj+vj7feE2KBBRMW3FzOpLOADl0Isb5587h/U4gGvkt5v60Z1VLG8BhYjbzRwyQZemwAd6cCR5/XFWLYZRIMpX39AR0tjaGGiGzLVyhse5C9RKC6ai42ppWPKiBagOvaYk8lO7DajerabOZP46Lby5wKjw1HCRx7p9sVMOWGzb/vA1hwiWc6jm3MvQDTogQkiqIhJV0nBQBTU+3okKCFDy9WwferkHjtxib7t3xIUQtHxnIwtx4mpg26/HfwVNVDb4oI9RHmx5WGelRVlrtiw43zboCLaxv46AZeB3IlTkwouebTr1y2NjSpHz68WNFjHvupy3q8TFn3Hos2IAk4Ju5dCo8B3wP7VPr/FGaKiG+T+v+TQqIrOqMTL1VdWV1DdmcbO8KXBz6esmYWYKPwDL5b5FA1a0hwapHiom0r/cKaoqr+27/XcrS5UwSMbQAAAABJRU5ErkJggg==)](https://deepwiki.com/Ezer015/pickacg)
[![Vercel](https://img.shields.io/website?url=https%3A%2F%2Fpickacg.ezers.top&up_message=Online&up_color=green&down_message=Offline&down_color=red&style=flat-square&logo=vercel&label=Vercel&labelColor=black&logoColor=white)](https://pickacg.ezers.top/)
[![License](https://img.shields.io/github/license/ezer015/pickacg?style=flat-square&labelColor=black&color=white)](./LICENSE)

![Screenshot](./public/screenshot.png)

[<img src="https://img.shields.io/badge/Try_Now-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Try Now" width="200">](https://pickacg.ezers.top/)

</div>

## ✨ Key Features

- 🔍 **Smart Tag System**: Dynamically aggregates tags based on search results, supports multi-tag combination filtering for precise content discovery.
- 📊 **Multi-dimensional Filtering**: Filter by rating range, air date, popularity, and more for in-depth content exploration.
- 📱 **Cross-platform Compatibility**: Responsive design that perfectly adapts to desktop and mobile devices, with automatic dark/light mode switching.
- 🔐 **Personalized Experience**: Integrated with Bangumi OAuth 2.0 for enhanced content access after login.
- ⚡ **Ultimate Performance**: Built with Next.js App Router and infinite scroll loading for a smooth browsing experience.
- 🎨 **Modern UI**: Crafted with shadcn/ui for a clean and elegant interface.

## 🚀 Quick Start

### Clone the repository

```bash
git clone https://github.com/Ezer015/pickacg.git
cd pickacg
```

### Install dependencies

```bash
pnpm install
```

### Start development server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to start developing.

## 📦 Build & Deploy

### Production Build

```bash
pnpm build
pnpm start
```

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Ezer015/pickacg)

## 🤝 Contributing

Issues and Pull Requests are welcome!

1. Fork this repository
2. Create your feature branch `git checkout -b feature/amazing-feature`
3. Commit your changes `git commit -m 'feat: add some amazing feature'`
4. Push to the branch `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the [GNU AGPL v3.0](./LICENSE) open source license.

## 🙏 Acknowledgments

- [Bangumi API](https://github.com/bangumi/api)
