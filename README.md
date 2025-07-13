# Product Management System

[![Wails](https://img.shields.io/badge/Wails-v2.10.2-blue?style=flat-square)](https://wails.io)
[![Go](https://img.shields.io/badge/Go-1.22.0+-00ADD8?style=flat-square&logo=go)](https://golang.org)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.2-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.1.8-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)

A modern and efficient product management system built with Wails, offering a native desktop experience with modern web technologies.

## 🚀 Features

- ✅ **Complete CRUD**: Create, list, edit and delete products
- 💱 **Multi-currency**: Support for BRL, USD and EUR with automatic conversion
- 🌍 **Internationalization**: Portuguese (BR) and English
- 🗄️ **SQLite Database**: Reliable local storage
- 🔄 **Auto-reconnection**: Robust connection recovery system
- 🎨 **Modern UI**: Elegant interface with TailwindCSS and shadcn/ui
- 📱 **Responsive**: Adaptive layout for different screen sizes
- 🌙 **Glassmorphism Design**: Modern visual with glass effects

## 🛠️ Technologies

### Backend (Go)

- **Wails v2.10.2**: Framework for desktop applications
- **SQLite**: Embedded database
- **Layered architecture**: Clear separation between presentation, service and data layers

### Frontend (React + TypeScript)

- **React 18.2.0**: User interface library
- **TypeScript 5.0.2**: Static typing
- **Vite**: Build tool and dev server
- **TailwindCSS 3.1.8**: Utility-first CSS framework
- **shadcn/ui**: Accessible UI components
- **React i18next**: Internationalization
- **Lucide React**: Modern icons

## 📋 Prerequisites

- [Go](https://golang.org/dl/) 1.22.0 or higher
- [Node.js](https://nodejs.org/) 18.0 or higher
- [Wails CLI](https://wails.io/docs/gettingstarted/installation)

### Installing Wails CLI

```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

## 🚀 Installation and Running

### 1. Clone the repository

```bash
git clone https://github.com/devDudu-21/product-management-system-app
cd wails-app
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

### 3. Install Go dependencies

```bash
go mod download
```

### 4. Development

To run in development mode:

```bash
wails dev
```

This will start:

- The Go backend with hot reload
- The React frontend in development mode
- Automatic connection between frontend and backend

### 5. Production build

```bash
wails build
```

The executables will be generated in the `build/bin/` folder.

## 🏗️ Build Scripts

The project includes scripts for multi-platform builds:

```bash
# Linux
./scripts/build.sh

# macOS (ARM)
./scripts/build-macos-arm.sh

# macOS (Intel)
./scripts/build-macos-intel.sh

# Windows
./scripts/build-windows.sh
```

## 📁 Project Structure

```text
wails-app/
├── core/                          # Business layer (Go)
│   ├── models.go                  # Data models
│   └── product_service.go         # Product services
├── frontend/                      # User interface (React)
│   ├── src/
│   │   ├── components/            # React components
│   │   │   ├── ui/               # Base components (shadcn/ui)
│   │   │   ├── ProductList.tsx   # Product list
│   │   │   ├── CurrencySelector.tsx
│   │   │   ├── LanguageSelector.tsx
│   │   │   └── DatabaseStatus.tsx
│   │   ├── hooks/                # Custom hooks
│   │   │   └── useCurrency.tsx   # Currency management hook
│   │   ├── services/             # Frontend services
│   │   │   └── currencyService.ts
│   │   ├── locales/              # Translation files
│   │   │   ├── en.json
│   │   │   └── pt-BR.json
│   │   └── wailsjs/              # Wails generated bindings
├── build/                        # Build files and resources
├── scripts/                      # Automation scripts
├── app.go                        # Main application (Go)
├── main.go                       # Entry point
└── wails.json                    # Wails configuration
```

## 💱 Currency System

The system supports multiple currencies with automatic conversion:

- **Base Currency**: Brazilian Real (BRL)
- **Supported Currencies**: USD, EUR
- **Conversion**: Automatic in the interface
- **Storage**: Always in BRL in the database

### Conversion Rates (Demo)

- 1 BRL = 0.20 USD
- 1 BRL = 0.18 EUR

> ⚠️ **Note**: Rates are fixed for demonstration purposes.

## 🌍 Internationalization

The project supports multiple languages:

- **Portuguese (Brazil)**: Default language
- **English**: Complete interface translation

### Adding new languages

1. Create a file in `frontend/src/locales/[code].json`
2. Add the language in `LanguageSelector.tsx`
3. Configure in `i18n.ts`

## 🗄️ Database

- **Type**: SQLite
- **File**: `database.db`
- **Location**: Project root
- **Features**:
  - Integrity checking
  - Automatic reconnection
  - Real-time health status

### Database Schema

```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL
);
```

## 🧪 Development

### Adding shadcn/ui components

```bash
cd frontend
npx shadcn-ui@latest add [component]
```

### Development structure

- **Hot Reload**: Automatic for Go and React
- **Debugging**: Detailed logs in development
- **DevTools**: React DevTools available

## 🏢 Architecture

### Backend Layer (Go)

```text
┌─────────────────┐
│   Wails App     │  ← Presentation layer
├─────────────────┤
│ Product Service │  ← Business layer
├─────────────────┤
│   SQLite DB     │  ← Data layer
└─────────────────┘
```

### Frontend Layer (React)

```text
┌─────────────────┐
│   Components    │  ← User interface
├─────────────────┤
│   Hooks/State   │  ← State management
├─────────────────┤
│   Services      │  ← Business logic
├─────────────────┤
│  Wails Bridge   │  ← Backend communication
└─────────────────┘
```

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is under the [LICENSE](LICENSE) license.

## 👨‍💻 Author

### Eduardo Fernandes

- Linkedin: [Eduardo Fernandes](www.linkedin.com/in/devdudu)

## 🎯 Next Features

- [ ] Real exchange rate API integration
- [ ] Data export (CSV, Excel)
- [ ] Category system
- [ ] Price history
- [ ] Reports and charts
- [ ] Dark/light theme
- [ ] Migrate database to PostgreSQL or MySQL.

## 🔧 Troubleshooting

### Common problems

**Database connection error:**

```bash
# Check if the database.db file has correct permissions
chmod 664 database.db
```

**Frontend dependencies:**

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Build failing:**

```bash
# Clean Wails cache
wails clean
# Rebuild
wails build
```
