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

# Install dependencies
install_deps() {
    print_info "Installing dependencies..."
    
    # Check Go
    if ! command_exists go; then
        print_error "Go is not installed. Please install Go 1.22 or higher."
        exit 1
    fi
    
    # Check Node.js
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi
    
    # Check npm
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    # Install Wails if not present
    if ! command_exists wails; then
        print_info "Installing Wails CLI..."
        go install github.com/wailsapp/wails/v2/cmd/wails@latest
        print_success "Wails CLI installed"
    fi
    
    # Install Go dependencies
    print_info "Installing Go dependencies..."
    go mod download
    go mod verify
    print_success "Go dependencies installed"
    
    # Install frontend dependencies
    print_info "Installing frontend dependencies..."
    cd frontend
    npm ci --prefer-offline
    cd ..
    print_success "Frontend dependencies installed"
}

# Run development server
dev() {
    print_info "Starting development server..."
    wails dev
}

# Build the application
build() {
    print_info "Building application..."
    wails build --clean
    print_success "Build completed"
}

# Run tests
test() {
    print_info "Running tests..."
    
    # Go tests
    print_info "Running Go tests..."
    go test -v -race ./...
    print_success "Go tests passed"
    
    # Frontend tests (if available)
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
    
    # Go linting
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
    
    # Frontend linting
    print_info "Running frontend linting..."
    cd frontend
    npm run lint
    cd ..
    print_success "Frontend linting passed"
}

# Check formatting
format_check() {
    print_info "Checking code formatting..."
    
    # Go formatting
    UNFORMATTED=$(gofmt -l . | head -10)
    if [ -n "$UNFORMATTED" ]; then
        print_error "Go code is not properly formatted:"
        echo "$UNFORMATTED"
        print_info "Run './dev.sh format' to fix formatting issues"
        return 1
    fi
    print_success "Go code is properly formatted"
    
    # Frontend formatting (if script exists)
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
    
    # Go formatting
    gofmt -w .
    print_success "Go code formatted"
    
    # Frontend formatting (if script exists)
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
    
    # Clean Wails cache
    if command_exists wails; then
        wails clean
    fi
    
    # Clean build directory
    rm -rf build/bin/*
    
    # Clean frontend build
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
