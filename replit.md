# Developer Tools Hub

## Overview

This is a comprehensive web application for developers that provides a collection of data conversion, formatting, and utility tools. The application features a "Smart Paste" functionality that automatically detects and formats various data types (JSON, JWT, Base64, URLs, timestamps, etc.) along with dedicated tools for specific tasks.

## Recent Changes (January 2025)

✓ **Database Integration Complete**: Successfully migrated from in-memory storage to PostgreSQL database
✓ **Schema Implementation**: Created comprehensive database schema with 4 tables (users, tool_usage, saved_data, api_history)
✓ **API Routes**: Added complete REST API endpoints for data persistence and retrieval
✓ **Storage Layer**: Implemented DatabaseStorage class with full CRUD operations
✓ **Database Connection**: Configured Neon PostgreSQL connection with Drizzle ORM
✓ **Schema Migration**: Successfully applied database schema using `npm run db:push`
✓ **Authentication System**: Implemented Replit OpenID Connect authentication
✓ **User Management**: Added sessions table and updated user schema for OAuth integration
✓ **Monetization Structure**: Created freemium pricing model (Free: 100 ops/day, Pro: $9.99/mo, Team: $19.99/user, Enterprise: custom)
✓ **Usage Tracking**: Implemented daily usage limits for free tier with automatic reset
✓ **User Interface Updates**: Added user profile display, pricing page, and authentication flow

✓ **Favorites System Fixed** (January 20, 2025): 
  - Created missing favorites table in PostgreSQL database
  - Fixed API parameter order in useFavorites hook
  - Centralized tools data in `/client/src/lib/toolsData.ts` for consistency
  - Updated Favorites page to display all 47 tools correctly (previously only showed 19)
  - Fixed TypeScript type definitions for favorites functionality

✓ **Data Visualization Tool Enhancement** (January 19, 2025): Transformed to JSON Crack-like interactive visualizer
  - Fixed paste functionality with automatic JSON detection and formatting
  - Enhanced visualization with rectangular nodes, collapsible/expandable functionality
  - Added interactive features: node selection, value copying, keyboard shortcuts
  - Improved visual design with type-specific colors and icons
  - Added security measures with proper JSON parsing error handling
  - **Multi-format Support**: Extended tool to support XML, YAML, and CSV data in addition to JSON
  - **Auto-detection**: Automatically detects data format when pasting
  - **Format-specific Examples**: Added example data for each supported format

✓ **Animated Micro-Interactions**: Implemented delightful animations using Framer Motion throughout the app
✓ **Tool Usage Tracking**: Integrated frontend tracking for tool usage with error handling
✓ **Enhanced UI/UX**: Added smooth transitions, hover effects, and animated feedback for user interactions
✓ **Auto-close Notifications**: Implemented automatic toast dismissal after 5 seconds with smooth fade-out animations
✓ **Marketing Landing Page**: Created impressive marketing page similar to Cursor's style with hero section, features, pricing, and animations
✓ **README.md Documentation**: Added comprehensive project documentation with installation guide, features list, tech stack, and contribution guidelines

✓ **New Tier 1 Tools Implementation**: Added high-priority tools from comprehensive analysis
✓ **YAML Converter**: Bidirectional conversion between YAML, JSON, and XML formats
✓ **SQL Formatter**: Format and beautify SQL queries with keyword casing and indentation options
✓ **XML Formatter/Validator**: Format, validate, and beautify XML documents with error detection
✓ **Password Strength Checker**: Analyze password strength with entropy calculation and crack time estimation
✓ **Unit Converter**: Convert between various units including CSS units, temperature, data storage, and more

✓ **Text Processing Tools Complete**: Implemented all 7 requested text processing tools
✓ **Text Statistics**: Word count, reading time, readability score, frequency analysis
✓ **Text Encoder/Decoder**: HTML entities, URL, Base64, Unicode, ASCII, Hex, Binary encoding
✓ **Text Replacer**: Batch find/replace with regex support and multiple rules
✓ **Line Tools**: Sort, deduplicate, shuffle, filter, and manipulate lines
✓ **Text Splitter**: Split by delimiter, length, words, lines, or regex patterns
✓ **Character Counter**: Detailed character analysis with breakdown and frequency
✓ **Markdown to HTML**: Live conversion with preview and HTML output

✓ **Database Tools Complete**: Implemented all 5 missing database tools
✓ **Database Schema Visualizer**: Generate ERD from SQL CREATE statements
✓ **SQL Query Builder**: Visual SQL query construction with live preview
✓ **Connection String Builder**: Generate connection strings for PostgreSQL, MySQL, MongoDB, etc.
✓ **Mock Data Generator**: Generate realistic test data in JSON, CSV, or SQL format

✓ **Security & Encryption Tools Complete**: Implemented all 4 critical security tools
✓ **SSL Certificate Analyzer**: Check cert validity, expiry, chain with domain analysis
✓ **Encryption/Decryption Tools**: AES, DES, RSA encryption with multiple modes
✓ **HMAC Generator**: Message authentication codes with SHA256/512, MD5, SHA3
✓ **Certificate Decoder**: Parse X.509 certificates with full extension support

✓ **File Processing Tools Complete**: Implemented all 3 requested file processing tools
✓ **File Checksum Calculator**: Multi-algorithm hash generator with MD5, SHA-256, SHA-512, SHA3, CRC32, BLAKE2
✓ **File Sum Calculator**: Advanced file analysis with encoding detection, line/word/character statistics, entropy calculation
✓ **Secure ZIP Viewer**: Client-side archive browser with security checks, path traversal protection, zip bomb detection

✓ **Image Converter**: Advanced format conversion with WebP/AVIF support, batch processing, client-side optimization
✓ **Code Minifier**: Minify and beautify JavaScript, CSS, HTML, JSON with compression statistics
✓ **SVG Optimizer**: Optimize SVG files with customizable options, remove metadata, clean paths
✓ **Cron Expression Builder**: Visual cron builder with next run preview and common patterns

✓ **Color Utility Tools Complete**: Implemented comprehensive color workflow tools
✓ **Color Palette Generator**: Generate harmonious color schemes using color theory principles (complementary, analogous, triadic, etc.)
✓ **Color Converter**: Convert between HEX, RGB, HSL, HSV, CMYK, and LAB color formats with live preview

→ **Total Tools**: 47 developer tools now available in the application

✓ **Smart Encode/Decode UI Redesign** (January 2025): Implemented intelligent interface for encode/decode tools
  - **Base64 Tool**: Smart detection with confidence scoring (60%+ threshold)
  - **URL Encoder**: Auto-detects URL encoding with confidence indicator (40%+ threshold)
  - **Swap Functionality**: Central swap button to exchange input/output with smooth animations
  - **Contextual Action Button**: Single button that adapts between encode/decode based on content
  - **Visual Feedback**: Real-time detection indicators, tooltips, and clear status messages
  - **Mobile Responsive**: Adapted layout with mobile-specific swap button

✓ **AI Virtual Assistant Implementation**: Added intelligent chatbot with 3D animated robot icon
✓ **Tool Knowledge Base**: Created comprehensive knowledge base for all 47 tools with input/output descriptions
✓ **Multi-Provider AI Support**: Integrated OpenAI, Claude, Gemini, and Azure OpenAI (Pro plan feature)
✓ **Interactive Features**: Tool-specific help, copy responses, settings panel for API configuration
✓ **Freemium Integration**: Free tier uses included AI, Pro users can use custom providers with their API keys
✓ **Robot Eye Tracking**: Implemented mouse-following eyes effect on AI assistant icon that tracks cursor within 200px radius
✓ **Sidebar Contrast Fix**: Fixed text visibility issue in dark theme by ensuring proper hover state colors
✓ **Sidebar Hover Effects Updated**: Added green hover effect for sidebar buttons for better visibility
✓ **Button Color Contrast**: Changed primary colors from pink/purple to blue for better contrast and visibility
✓ **Click State Enhancement**: Added active state feedback with scale and color changes for better user interaction
✓ **Responsive Design Implementation**: Improved mobile/tablet responsiveness across all tools and components
  - Updated grid layouts from lg: to md: breakpoints for better tablet support
  - Reduced minimum heights and font sizes on mobile devices
  - Added responsive button layouts with centered alignment on mobile
  - Improved Smart Paste component with better mobile layouts
  - Enhanced sidebar to be mobile-friendly with backdrop and slide animations
  - Optimized text areas, inputs, and output displays for smaller screens

✓ **Tool Data History Feature Implementation**: Added auto-save and load functionality for tool usage (January 2025)
✓ **Auto-Save System**: Implemented debounced auto-save (2s delay) that saves tool input/output after each operation
✓ **Data Loading**: Click from Recent Activity loads previous data with `?loadData=true` parameter
✓ **Save Indicator**: Visual feedback shows when data is being saved with animated icon
✓ **Hooks Created**: useAutoSave and useToolData hooks for reusable functionality across all tools
✓ **API Endpoints**: Added `/api/saved-data/latest/:toolId` for fetching most recent tool data
✓ **Updated Tools**: JSONFormatter and Base64Tool now support full data history functionality

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state, React Context for theme management
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Server**: Express.js with TypeScript
- **Development**: Node.js with hot reloading via Vite integration
- **Storage**: In-memory storage with interface for future database integration
- **API**: RESTful endpoints (currently minimal, designed for expansion)

### Key Components

#### Smart Paste System
- **Auto-detection**: Automatically identifies data types from pasted content
- **Supported Formats**: JSON, JWT, Base64, URL, timestamp, hex colors, XML, YAML
- **Confidence Scoring**: Provides confidence levels for detected formats
- **Context-aware Actions**: Offers relevant tools based on detected data type

#### Tool Suite (45 tools)
- **Data Converters (9)**: JSON formatter, Base64 encoder/decoder, URL encoder/decoder, CSV converter, Markdown converter, YAML converter, XML formatter, Unit converter, Code minifier
- **Validators (3)**: Regex tester, JWT debugger, text diff checker
- **Generators (6)**: UUID generator, hash generator, Lorem Ipsum generator, password generator, QR code generator, Cron expression builder
- **Timestamp Tools (1)**: Unix timestamp conversion with timezone support
- **API & Network (1)**: HTTP client with request history, cURL generation
- **CSS & Design (4)**: Grid generator, color palette generator, color converter, box shadow generator
- **Text Processing (8)**: Case converter, Text statistics, Text encoder/decoder, Text replacer, Line tools, Text splitter, Character counter, Markdown to HTML
- **Database Tools (5)**: SQL formatter, Schema visualizer (ERD), SQL query builder, Connection string builder, Mock data generator
- **Security Tools (5)**: Password strength checker, SSL certificate analyzer, Encryption/decryption tools, HMAC generator, Certificate decoder
- **File Tools (5)**: File checksum calculator, File sum calculator (analyzer), Secure ZIP viewer, Image converter, SVG optimizer

#### User Interface
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Dark/Light Theme**: System preference detection with manual toggle
- **Sidebar Navigation**: Collapsible sidebar with tool categorization
- **Search Functionality**: Filter tools by name or category

## Data Flow

1. **Input Processing**: User pastes content into Smart Paste component
2. **Auto-detection**: System analyzes input using pattern matching and validation
3. **Format Detection**: Returns detected type with confidence score
4. **Tool Suggestion**: Presents relevant tools and actions based on detection
5. **Tool Integration**: Seamless navigation to specialized tools with pre-filled data

## External Dependencies

### Core Dependencies
- **React Ecosystem**: React, React DOM, React Router (Wouter)
- **UI Library**: Radix UI components, Tailwind CSS, class-variance-authority
- **Data Handling**: TanStack Query, React Hook Form, Zod validation
- **Database**: Drizzle ORM configured for PostgreSQL (via Neon)
- **Development**: Vite, TypeScript, ESBuild

### Utility Libraries
- **Date Handling**: date-fns for timestamp operations
- **Styling**: clsx, tailwind-merge for conditional classes
- **Clipboard**: Native Web API with custom hook wrapper
- **Icons**: Lucide React for consistent iconography

## Database Schema

The application uses Drizzle ORM with PostgreSQL support:
- **Users Table**: Basic user management (id, username, password, createdAt)
- **Tool Usage Table**: Track tool usage statistics (id, userId, toolId, toolName, usageCount, lastUsed, createdAt)
- **Saved Data Table**: Store user-saved data and snippets (id, userId, toolId, title, content, createdAt, updatedAt)
- **API History Table**: Store API request history (id, userId, method, url, headers, body, responseStatus, responseTime, createdAt)
- **Schema Location**: `/shared/schema.ts` for shared types
- **Migrations**: Automated via Drizzle Kit
- **Database Connection**: Configured via `/server/db.ts` with Neon PostgreSQL
- **Storage Layer**: Implemented in `/server/storage.ts` with complete CRUD operations

## Deployment Strategy

### Development Environment
- **Hot Reloading**: Vite dev server with Express integration
- **Database**: Neon PostgreSQL for development and production
- **Environment Variables**: DATABASE_URL for database connection

### Production Build
- **Frontend**: Vite builds to `/dist/public`
- **Backend**: ESBuild bundles server to `/dist/index.js`
- **Static Serving**: Express serves built frontend assets
- **Database**: Production PostgreSQL via Neon

### Architecture Decisions

**Problem**: Need for fast, interactive data processing tools for developers
**Solution**: Client-side processing with intelligent auto-detection
**Rationale**: Reduces server load and provides instant feedback

**Problem**: Maintaining consistent UI across numerous tools
**Solution**: Centralized component library with shadcn/ui
**Rationale**: Ensures design consistency and reduces development time

**Problem**: Supporting multiple data formats and conversions
**Solution**: Modular tool architecture with shared utilities
**Rationale**: Enables easy addition of new tools and maintains code reusability

**Problem**: Database flexibility for future features
**Solution**: Drizzle ORM with PostgreSQL
**Rationale**: Type-safe database operations with easy schema migrations