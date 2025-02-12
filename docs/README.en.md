<div align="center">

<img src="../favicon.ico" alt="Pick Anime Cool Logo" width="64" height="64">

# Pick Anime Cool

  A powerful multi-tag anime search interface powered by Bangumi API

[简体中文](../README.md) | **English**

[![Live Demo](https://img.shields.io/badge/Try%20It-Live%20Demo-4285f4?style=for-the-badge&logo=github)](https://ezer015.github.io/pick-anime-cool/)
[![License](https://img.shields.io/badge/License-AGPL--3.0-43a047?style=for-the-badge&logo=gnu)](../LICENSE)
![Platform](https://img.shields.io/badge/Platform-Web-FF7139?style=for-the-badge&logo=firefox-browser)

![Pick Anime Cool Screenshot](./images/theme_comparison.png)

> Pick something cool to watch by combining tags, ratings, and rankings with an elegant and accessible design.

</div>

## 🌟 Key Features

### 🎯 Multi-Tag Search System

- Smart tag suggestions based on search results
- Combine multiple tags for precise filtering
- Interactive tag management interface

### 📊 Advanced Filtering

- Precise rating filters
- Flexible air date filtering
- Smart rank range filtering
- Multi-dimensional sorting (by match score, popularity, or rank)
- Content type selection (animation, books, music, games, real-life)

### 🎨 User Experience

- Responsive design for all devices
- Dark/Light theme toggle
- Infinite scroll loading
- Quick navigation buttons
- Context menu for title copying

## 🚀 Getting Started

### Quick Start

1. Visit: [Live Demo](https://ezer015.github.io/pick-anime-cool/)
2. Select content type
3. Type keywords to search (or leave blank for all)
4. Click suggested tags or anime card tags
5. Fine-tune results using filters

### Local Development

```bash
# Clone the repository
git clone https://github.com/ezer015/pick-anime-cool.git

# Navigate to project directory
cd pick-anime-cool

# Start a local server (Python example)
python -m http.server

# Visit in browser
open http://localhost:8000
```

## 🛠️ Technical Details

### Architecture

```
src/
├── js/
│   └── main.js         # Core search functionality
└── styles/
    ├── base.css        # Base styles and reset
    ├── components.css  # UI components
    ├── main.css        # Main application styles
    └── utilities.css   # Utility classes
```

### Tech Stack

- 🌐 Vanilla JavaScript (ES6+)
- 🎨 CSS3 with Custom Properties
- 📱 Responsive HTML5
- 🔌 Bangumi API v0 Integration

### API Integration

- Endpoint: `POST /v0/search/subjects`
- Features:
  - Advanced filtering
  - Custom sorting
  - Pagination support
  - Error handling
  - CORS compliance

## 📄 License

This project is released under the [GNU AGPL v3.0](../LICENSE) open source license.

## 🙏 Acknowledgments

- [Bangumi API](https://bangumi.github.io/api/) - For providing comprehensive anime data
