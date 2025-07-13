# Product Management System

[![Wails](https://img.shields.io/badge/Wails-v2.10.2-blue?style=flat-square)](https://wails.io)
[![Go](https://img.shields.io/badge/Go-1.22.0+-00ADD8?style=flat-square&logo=go)](https://golang.org)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.2-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.1.8-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)
[![CI](https://github.com/devDudu-21/product-management-system-app/workflows/CI/badge.svg)](https://github.com/devDudu-21/product-management-system-app/actions/workflows/ci.yml)
[![Release](https://github.com/devDudu-21/product-management-system-app/workflows/Release/badge.svg)](https://github.com/devDudu-21/product-management-system-app/actions/workflows/release.yml)
[![License](https://img.shields.io/github/license/devDudu-21/product-management-system-app?style=flat-square)](LICENSE)

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

## 🔄 CI/CD Pipeline

This project includes a comprehensive CI/CD pipeline with multiple automated workflows:

### 🚦 Workflows Overview

| Workflow           | Trigger                 | Purpose                      | Status                                                                                                                                                                                                                 |
| ------------------ | ----------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CI**             | Push/PR to main/develop | Continuous Integration       | [![CI](https://github.com/devDudu-21/product-management-system-app/workflows/CI/badge.svg)](https://github.com/devDudu-21/product-management-system-app/actions/workflows/ci.yml)                                      |              |
| **Build & Test**   | Schedule/Manual         | Multi-platform build testing | [![Build](https://github.com/devDudu-21/product-management-system-app/workflows/Build%20and%20Test/badge.svg)](https://github.com/devDudu-21/product-management-system-app/actions/workflows/build-test.yml)           |
| **Release**        | Tags/Manual             | Automated releases           | [![Release](https://github.com/devDudu-21/product-management-system-app/workflows/Release/badge.svg)](https://github.com/devDudu-21/product-management-system-app/actions/workflows/release.yml)                       |
| **Staging Deploy** | Push to develop         | Deploy to staging            | [![Staging](https://github.com/devDudu-21/product-management-system-app/workflows/Deploy%20Staging/badge.svg)](https://github.com/devDudu-21/product-management-system-app/actions/workflows/staging.yml)              |

### 🎯 CI Workflow Features

- **Fast Feedback**: Results in ~5-10 minutes
- **Parallel Execution**: Tests and builds run concurrently
- **Coverage Reports**: Automatic code coverage with Codecov integration
- **Artifact Storage**: Build artifacts stored for 7 days
- **Fail-Fast**: Quick failure detection with detailed logs

### 🏗️ Build Matrix

The project supports building for multiple platforms:

```text
✅ Linux (amd64)
✅ Windows (amd64)
✅ macOS Intel (amd64)
✅ macOS Apple Silicon (arm64)
```

### 🔐 Security Features

- **Dependency Scanning**: Weekly automated dependency updates
- **Vulnerability Checks**: Daily security scans with Gosec
- **CodeQL Analysis**: Advanced semantic code analysis
- **SARIF Reports**: Security findings uploaded to GitHub Security tab
- **Auto-merge**: Safe automatic merging of minor dependency updates

### 📊 Quality Assurance

- **Linting**: golangci-lint for Go, ESLint for TypeScript
- **Formatting**: Automatic code formatting checks
- **Testing**: Unit tests with race condition detection
- **Benchmarks**: Performance regression detection
- **Memory Profiling**: Memory leak detection

### 🚀 Deployment Pipeline

#### Staging Environment

- **Trigger**: Push to `develop` branch
- **Purpose**: Automated staging deployments for testing
- **Features**:
  - Smoke tests
  - Build verification
  - Artifact retention (14 days)

#### Production Releases

- **Trigger**: Git tags (`v*`) or manual dispatch
- **Features**:
  - Multi-platform builds
  - Automatic release notes generation
  - Asset uploads with detailed descriptions
  - Pre-release support

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

We welcome contributions! Our automated CI/CD pipeline ensures code quality and smooth integration.

### Development Workflow

1. **Fork the project**
2. **Create a feature branch**: `git checkout -b feature/AmazingFeature`
3. **Make your changes** following our coding standards
4. **Test locally**: `wails dev` to verify your changes
5. **Commit your changes**: `git commit -m 'Add some AmazingFeature'`
6. **Push to the branch**: `git push origin feature/AmazingFeature`
7. **Open a Pull Request**

### Automated Checks

When you open a PR, our CI/CD pipeline will automatically:

- ✅ **Run tests**: Go unit tests with race detection
- ✅ **Check code quality**: Linting and formatting validation
- ✅ **Build verification**: Multi-platform build testing
- ✅ **Dependency review**: Automated dependency analysis

### Coding Standards

- **Go**: Follow `gofmt` formatting and `golangci-lint` rules
- **TypeScript/React**: Use ESLint configuration and Prettier formatting
- **Commits**: Use conventional commit messages
- **Tests**: Add tests for new features and bug fixes

### Local Development Setup

```bash
# Install dependencies
cd frontend && npm install && cd ..
go mod download

# Run in development mode
wails dev

# Run tests
go test -race ./...
cd frontend && npm test

# Check formatting
gofmt -l .
cd frontend && npm run lint
```

### Release Process

- **Patch releases**: Automatic via Dependabot for dependency updates
- **Minor/Major releases**: Manual tag creation triggers automated release
- **Staging**: All commits to `develop` branch auto-deploy to staging

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
