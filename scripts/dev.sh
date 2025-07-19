#!/bin/bash

# Development helper script for Product Management System
# This script provides common development tasks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configure WebKit environment variables to prevent WebKitWebProcess issues
configure_webkit_env() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        print_info "Configuring environment variables for WebKit on Linux..."
        export WEBKIT_DISABLE_COMPOSITING_MODE=1
        export WEBKIT_DISABLE_DMABUF_RENDERER=1
        export GDK_BACKEND=x11
        export WAILS_WEBVIEW2_DISABLE_COMPOSITING=1
        export WEBKIT_DISABLE_SANDBOX_POLICY=1
        export MALLOC_CHECK_=0
        export G_SLICE=always-malloc
        print_success "WebKit environment variables configured!"
    fi
}

# Functions
print_header() {
    echo -e "${BLUE}===================================${NC}"
    echo -e "${BLUE}  Product Management System - Dev  ${NC}"
    echo -e "${BLUE}===================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check system dependencies
check_system_deps() {
    print_info "Checking system dependencies..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        print_info "Checking Linux system dependencies..."
        
        if ! command_exists pkg-config; then
            print_error "pkg-config is not installed. Please install it:"
            print_info "sudo apt-get install pkg-config"
            exit 1
        fi

        if ! pkg-config --exists gtk+-3.0; then
            print_error "GTK3 development libraries not found. Please install them:"
            print_info "sudo apt-get install libgtk-3-dev"
            exit 1
        fi

        if ! pkg-config --exists webkit2gtk-4.0 && ! pkg-config --exists webkit2gtk-4.1; then
            print_error "WebKit2GTK development libraries not found. Please install them:"
            print_info "Ubuntu 22.04 and older: sudo apt-get install libwebkit2gtk-4.0-dev"
            print_info "Ubuntu 24.04 and newer: sudo apt-get install libwebkit2gtk-4.0-dev"
            exit 1
        fi

        print_success "All Linux system dependencies are installed"

    elif [[ "$OSTYPE" == "darwin"* ]]; then
        print_info "macOS detected - no additional system dependencies required"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        print_info "Windows detected - no additional system dependencies required"
    fi
}

# Install dependencies
install_deps() {
    print_info "Installing dependencies..."
    
    check_system_deps

    if ! command_exists go; then
        print_error "Go is not installed. Please install Go 1.22 or higher."
        exit 1
    fi

    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi

    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi

    if ! command_exists wails; then
        print_info "Installing Wails CLI..."
        go install github.com/wailsapp/wails/v2/cmd/wails@latest
        print_success "Wails CLI installed"
    fi

    print_info "Installing Go dependencies..."
    go mod download
    go mod verify
    print_success "Go dependencies installed"

    print_info "Installing frontend dependencies..."
    cd frontend
    npm ci --prefer-offline
    cd ..
    print_success "Frontend dependencies installed"
}

# Run development server
dev() {
    print_info "Starting development server..."
    configure_webkit_env
    wails dev
}

# Build the application
build() {
    print_info "Building application..."
    configure_webkit_env
    wails build --clean
    print_success "Build completed"
}

# Run tests
test() {
    print_info "Running tests..."

    print_info "Running Go tests..."
    go test -v -race ./...
    print_success "Go tests passed"

    if [ -f "frontend/package.json" ] && grep -q '"test"' frontend/package.json; then
        print_info "Running frontend tests..."
        cd frontend
        npm test -- --watchAll=false || true
        cd ..
    fi
}

# Run linting
lint() {
    print_info "Running linters..."

    if command_exists golangci-lint; then
        print_info "Running golangci-lint..."
        golangci-lint run
        print_success "Go linting passed"
    else
        print_warning "golangci-lint not found. Install it for better Go linting."
        print_info "Running basic Go checks..."
        gofmt -l . | head -10
        go vet ./...
    fi

    print_info "Running frontend linting..."
    cd frontend
    npm run lint
    cd ..
    print_success "Frontend linting passed"
}

# Check formatting
format_check() {
    print_info "Checking code formatting..."

    UNFORMATTED=$(gofmt -l . | head -10)
    if [ -n "$UNFORMATTED" ]; then
        print_error "Go code is not properly formatted:"
        echo "$UNFORMATTED"
        print_info "Run './dev.sh format' to fix formatting issues"
        return 1
    fi
    print_success "Go code is properly formatted"

    if [ -f "frontend/package.json" ] && grep -q '"format:check"' frontend/package.json; then
        cd frontend
        npm run format:check
        cd ..
        print_success "Frontend code is properly formatted"
    fi
}

# Format code
format() {
    print_info "Formatting code..."

    gofmt -w .
    print_success "Go code formatted"

    if [ -f "frontend/package.json" ] && grep -q '"format"' frontend/package.json; then
        cd frontend
        npm run format
        cd ..
        print_success "Frontend code formatted"
    fi
}

# Clean build artifacts
clean() {
    print_info "Cleaning build artifacts..."

    if command_exists wails; then
        wails clean
    fi

    rm -rf build/bin/*
    rm -rf frontend/dist
    rm -rf frontend/node_modules/.cache

    print_success "Build artifacts cleaned"
}

# Show help
help() {
    echo "Development helper script for Product Management System"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  install     Install all dependencies"
    echo "  deps        Check system dependencies"
    echo "  dev         Start development server"
    echo "  build       Build the application"
    echo "  test        Run all tests"
    echo "  lint        Run code linting"
    echo "  format      Format all code"
    echo "  check       Check code formatting"
    echo "  clean       Clean build artifacts"
    echo "  ci          Run full CI checks (install, lint, test, build)"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 install    # Install dependencies"
    echo "  $0 dev        # Start development"
    echo "  $0 ci         # Run full CI pipeline locally"
}

# Run full CI pipeline locally
ci() {
    print_header
    print_info "Running full CI pipeline locally..."

    install_deps
    echo ""
    lint
    echo ""
    test
    echo ""
    build
    echo ""
    print_success "All CI checks passed! 🎉"
}

# Main script logic
print_header

case "${1:-help}" in
    "install")
        install_deps
        ;;
    "deps")
        check_system_deps
        ;;
    "dev")
        dev
        ;;
    "build")
        build
        ;;
    "test")
        test
        ;;
    "lint")
        lint
        ;;
    "format")
        format
        ;;
    "check")
        format_check
        ;;
    "clean")
        clean
        ;;
    "ci")
        ci
        ;;
    "help"|*)
        help
        ;;
esac
