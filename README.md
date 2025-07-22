<div align="center">

![AI4AgriWeather Logo](https://img.shields.io/badge/🌾-AI4AgriWeather-green?style=for-the-badge&labelColor=2d5016&color=4ade80)

# AI4AgriWeather
### Smart Agricultural Weather Intelligence Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB?logo=react)](https://reactjs.org/)
[![Powered by Supabase](https://img.shields.io/badge/Powered%20by-Supabase-3ECF8E?logo=supabase)](https://supabase.com/)
[![Deploy with Railway](https://img.shields.io/badge/Deploy%20with-Railway-0B0D0E?logo=railway)](https://railway.app/)
[![Multilingual](https://img.shields.io/badge/Languages-한국어%20%7C%20English%20%7C%20Kiswahili-blue)](https://github.com/LeGenAI/AI4AgriWeather)

*Empowering African farmers with AI-driven weather intelligence and agricultural insights*

[🚀 Live Demo](https://ai4agriweather-production.up.railway.app) • [📖 Documentation](#-features) • [🌍 Languages](#-internationalization) • [🤝 Contributing](#-contributing)

</div>

---

## 🌟 About The Project

AI4AgriWeather is a comprehensive smart agricultural platform specifically designed for African farmers, particularly those in Tanzania and East Africa. Built with modern web technologies and powered by AI, it provides multilingual weather intelligence, crop management tools, and agricultural insights to help farmers make informed decisions and improve their productivity.

### 🎯 Mission
To bridge the digital divide in agriculture by providing accessible, localized, and intelligent farming solutions that understand the unique challenges of African agriculture.

## ✨ Features

### 🌤️ Weather Intelligence
- **24-hour, 7-day & Seasonal Forecasts** - Comprehensive weather predictions
- **Agricultural Weather Metrics** - Evapotranspiration, soil moisture, UV index, growing degree days
- **Weather-based Recommendations** - AI-powered farming advice based on current conditions
- **Real-time Alerts** - Critical weather warnings and agricultural notifications

### 🌱 Crop Management
- **22 Local Crop Varieties** - From Mahindi (corn) to Mhogo (cassava)
- **Planting Calendar** - Seasonal planting recommendations for Masika and Vuli seasons
- **Health Monitoring** - Crop status tracking and disease prevention
- **Harvest Planning** - Optimal timing and yield predictions
- **Market Price Tracking** - Current market rates and price trends

### 🤖 AI-Powered Agricultural Assistant
- **Multilingual Chat Support** - Get farming advice in your preferred language
- **Knowledge Base** - Comprehensive agricultural documentation and best practices
- **Smart Recommendations** - Personalized farming strategies based on local conditions
- **Pest & Disease Identification** - AI-powered diagnosis and treatment recommendations

### 🌍 Regional Specialization
- **29 Tanzanian Regions** - Localized data for all major farming areas
- **Traditional Farming Wisdom** - Integration of local agricultural knowledge
- **Climate-specific Guidance** - Tailored advice for tropical and semi-arid conditions
- **Local Market Integration** - Regional price data and market access information

## 🌐 Internationalization

AI4AgriWeather supports three languages to ensure accessibility across diverse user bases:

| Language | Region | Flag | Coverage |
|----------|--------|------|----------|
| **English** | International | 🇺🇸 | Complete UI and content |
| **한국어 (Korean)** | South Korea | 🇰🇷 | Complete UI and content |
| **Kiswahili** | Tanzania & East Africa | 🇹🇿 | Complete UI and content |

*Language detection is automatic based on browser settings, with manual selection available in the header.*

## 🛠️ Technology Stack

### Frontend
- **⚛️ React 18.3** - Modern UI framework with hooks
- **📘 TypeScript** - Type-safe development
- **🎨 Tailwind CSS** - Utility-first styling with agricultural theme
- **🧭 React Router v6** - Client-side navigation
- **🔄 React Query** - Server state management
- **📱 Responsive Design** - Mobile-first approach

### Backend & Infrastructure
- **🐘 Supabase** - PostgreSQL database with real-time features
- **🔐 Row Level Security** - User-based data protection
- **🔍 Vector Search** - AI-powered document search (pgvector)
- **🚀 Express.js** - Static file serving
- **🐳 Docker** - Containerized deployment

### AI & Integration
- **🤖 LLM Integration** - ChatGPT-based agricultural assistance
- **🔄 n8n Workflows** - Backend automation and data processing
- **🌐 i18next** - Internationalization framework
- **📊 Recharts** - Data visualization for weather and crop analytics

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- (Optional) n8n instance for advanced features

### 1. Clone the Repository
```bash
git clone https://github.com/LeGenAI/AI4AgriWeather.git
cd AI4AgriWeather
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
npm start
```

## 🏗️ Database Schema

The platform uses Supabase with the following key tables:

```sql
-- User profiles with agricultural preferences
profiles (id, email, full_name, farm_location, preferred_crops)

-- Agricultural knowledge base
notebooks (id, title, content, category, user_id)

-- Weather and crop data sources
sources (id, title, file_url, notebook_id)

-- AI chat conversations
n8n_chat_histories (id, message, response, user_id)

-- Vector embeddings for intelligent search
documents (id, content, embedding, metadata)
```

## 🌍 Agricultural Categories

The platform organizes information into specialized agricultural categories:

- 🌦️ **Weather & Climate** - Forecasting and climate adaptation
- 🌱 **Crop Management** - Planting, growing, and harvesting
- 🐛 **Pest & Disease** - Identification and treatment
- 💰 **Market Information** - Prices and trading opportunities
- 🏞️ **Soil Management** - Soil health and fertilization
- 💧 **Irrigation** - Water management and conservation
- 👨‍🌾 **General Farming** - Best practices and techniques

## 📱 Screenshots

<div align="center">

### Dashboard Overview
![Dashboard](https://via.placeholder.com/800x400/4ade80/ffffff?text=Agricultural+Dashboard)

### Weather Center
![Weather Center](https://via.placeholder.com/800x400/3b82f6/ffffff?text=Weather+Intelligence)

### Crop Management
![Crop Management](https://via.placeholder.com/800x400/f59e0b/ffffff?text=Crop+Management)

### AI Assistant
![AI Chat](https://via.placeholder.com/800x400/8b5cf6/ffffff?text=AI+Agricultural+Assistant)

</div>

## 🚀 Deployment

### Railway (Recommended)
```bash
# Deploy to Railway
railway login
railway link
railway up
```

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/qxxaLy)

### Docker
```bash
# Build and run with Docker
docker build -t ai4agriweather .
docker run -p 8080:8080 ai4agriweather
```

### Vercel
```bash
# Deploy to Vercel
vercel --prod
```

## 📊 Performance

- ⚡ **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices)
- 📱 **Mobile Optimized**: Responsive design for all device sizes
- 🌐 **Global CDN**: Fast loading times worldwide
- 🔍 **SEO Optimized**: Meta tags and structured data

## 🤝 Contributing

We welcome contributions from the agricultural and tech communities! Here's how you can help:

### Development Setup
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Install dependencies (`npm install`)
4. Start the development server (`npm run dev`)
5. Make your changes and test thoroughly
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Contribution Guidelines
- 🌱 **Agricultural Focus**: Ensure features benefit farmers and agricultural productivity
- 🌍 **Accessibility**: Consider users with limited internet and device capabilities
- 🗣️ **Multilingual**: Update translations for new features
- 📚 **Documentation**: Include clear documentation for new features
- 🧪 **Testing**: Add tests for new functionality

### Types of Contributions We Welcome
- 🌾 New crop varieties and regional data
- 🌡️ Additional weather metrics and calculations
- 🗣️ Translation improvements and new languages
- 🐛 Bug fixes and performance improvements
- 📖 Documentation and user guides
- 🎨 UI/UX enhancements

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **🌍 Open Source Community** - For the amazing tools and libraries
- **👨‍🌾 African Farmers** - For inspiring this project and providing valuable insights
- **🏫 Educational Institutions** - For supporting agricultural technology research
- **🤝 Contributors** - For their valuable contributions to the project

## 📞 Support & Community

- 🐛 **Bug Reports**: [Open an Issue](https://github.com/LeGenAI/AI4AgriWeather/issues)
- 💡 **Feature Requests**: [Start a Discussion](https://github.com/LeGenAI/AI4AgriWeather/discussions)
- 📧 **Contact**: [agriculture@example.com](mailto:agriculture@example.com)
- 🌐 **Website**: [Coming Soon]()

---

<div align="center">

**Made with 💚 for African Agriculture**

*Empowering farmers through technology, one harvest at a time.*

[![Star this repository](https://img.shields.io/github/stars/LeGenAI/AI4AgriWeather?style=social)](https://github.com/LeGenAI/AI4AgriWeather/stargazers)

</div>