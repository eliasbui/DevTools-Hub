# DevTools Hub 🛠️

A comprehensive web-based developer tools platform with smart paste auto-detection, 47+ professional utilities, and AI assistance.

![DevTools Hub](https://img.shields.io/badge/tools-47+-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-18.0-blue)

## 🚀 Features

### Smart Paste Detection
Automatically detects and formats various data types:
- JSON, JWT, Base64, URLs
- Timestamps, Hex colors
- XML, YAML, and more

### 47+ Developer Tools
Comprehensive suite organized into categories:

#### Data Tools (9)
- JSON Formatter
- Base64 Encoder/Decoder
- URL Encoder/Decoder
- CSV Converter
- Markdown Converter
- YAML Converter
- XML Formatter
- Unit Converter
- Code Minifier

#### Text Processing (8)
- Case Converter
- Text Statistics
- Text Encoder/Decoder
- Text Replacer
- Line Tools
- Text Splitter
- Character Counter
- Markdown to HTML

#### Security & Encryption (5)
- Password Strength Checker
- SSL Certificate Analyzer
- Encryption/Decryption Tools
- HMAC Generator
- Certificate Decoder

#### Database Tools (5)
- SQL Formatter
- Schema Visualizer (ERD)
- SQL Query Builder
- Connection String Builder
- Mock Data Generator

#### File Processing (5)
- File Checksum Calculator
- File Analyzer
- Secure ZIP Viewer
- Image Converter
- SVG Optimizer

#### CSS & Design (4)
- Grid Generator
- Color Palette Generator
- Color Converter
- Box Shadow Generator

#### Generators (6)
- UUID Generator
- Hash Generator
- Lorem Ipsum Generator
- Password Generator
- QR Code Generator
- Cron Expression Builder

#### API & Network (1)
- HTTP Client with cURL generation

### AI Virtual Assistant
- Interactive 3D animated robot assistant
- Tool-specific help and guidance
- Multiple AI provider support (OpenAI, Claude, Gemini)
- Context-aware suggestions

### Additional Features
- 🌓 Dark/Light theme support
- ⭐ Favorites system
- 📊 Usage tracking and analytics
- 🔐 User authentication
- 💾 Data persistence
- 📱 Fully responsive design

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** with shadcn/ui
- **Framer Motion** for animations
- **TanStack Query** for data fetching
- **Wouter** for routing

### Backend
- **Express.js** with TypeScript
- **PostgreSQL** with Drizzle ORM
- **Neon** for database hosting
- **OpenID Connect** authentication

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or use Neon)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/devtools-hub.git
cd devtools-hub
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example env file
cp .env.example .env

# Add your database URL and other secrets
DATABASE_URL=your_postgresql_url
SESSION_SECRET=your_session_secret
# Add AI provider keys as needed
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GEMINI_API_KEY=your_gemini_key
```

4. Push database schema:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## 📁 Project Structure

```
devtools-hub/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and helpers
├── server/              # Express backend
│   ├── routes/          # API routes
│   ├── storage.ts       # Database operations
│   └── index.ts         # Server entry point
├── shared/              # Shared types and schemas
│   └── schema.ts        # Database schema
└── package.json         # Dependencies and scripts
```

## 🎯 Usage

### Smart Paste
1. Navigate to the home page
2. Paste any data into the Smart Paste input
3. The system automatically detects the format
4. Click on suggested tools to process your data

### Using Tools
1. Browse tools by category in the sidebar
2. Click on any tool to open it
3. Input your data and configure options
4. Copy or download the results

### AI Assistant
1. Click the robot icon in the bottom right
2. Ask questions about any tool
3. Get help with data formatting
4. Learn keyboard shortcuts and tips

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Ensure all tools work offline
- Maintain responsive design

## 📊 Monetization

DevTools Hub uses a freemium model:

### Free Tier
- 100 operations per day
- Access to all tools
- Basic AI assistance

### Pro Tier ($9.99/month)
- Unlimited operations
- API history persistence
- Custom AI providers
- Priority support

### Team Tier ($19.99/user/month)
- Everything in Pro
- Team collaboration
- Admin dashboard
- API access

## 🔒 Privacy & Security

- All data processing happens locally in your browser
- No data is sent to servers without explicit consent
- User data is encrypted and secure
- SOC 2 compliant infrastructure

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ for developers worldwide
- Inspired by the need for better developer tools
- Thanks to all contributors and users

## 📧 Contact

- Website: [devtools-hub.com](https://devtools-hub.com)
- Email: support@devtools-hub.com
- Twitter: [@devtoolshub](https://twitter.com/devtoolshub)

---

Made with ☕ and 💻 by developers, for developers