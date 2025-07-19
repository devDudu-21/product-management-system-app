#!/bin/bash

# Script to fix WebKitWebProcess issues on Linux

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info "Starting WebKit issue check and fix..."

# Verify if the system is Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    print_warning "This script is specific to Linux. Detected system: $OSTYPE"
    exit 0
fi

# Check and install WebKit dependencies
print_info "Checking WebKit dependencies..."

# List of required packages
PACKAGES=(
    "libwebkit2gtk-4.0-dev"
    "libgtk-3-dev" 
    "pkg-config"
    "build-essential"
    "libglib2.0-dev"
    "libgdk-pixbuf2.0-dev"
    "libcairo-gobject2"
    "libpango1.0-dev"
    "libatk1.0-dev"
    "libgtk-3-0"
    "libwebkit2gtk-4.0-37"
)

# Function to check if a package is installed
is_package_installed() {
    dpkg -l | grep -q "^ii  $1 "
}

# Check packages
missing_packages=()
for package in "${PACKAGES[@]}"; do
    if ! is_package_installed "$package"; then
        missing_packages+=("$package")
    fi
done

if [ ${#missing_packages[@]} -gt 0 ]; then
    print_warning "Missing packages detected: ${missing_packages[*]}"
    print_info "Attempting to install missing packages..."
    
    sudo apt-get update
    for package in "${missing_packages[@]}"; do
        print_info "Installing $package..."
        sudo apt-get install -y "$package" || print_warning "Failed to install $package"
    done
else
    print_success "All WebKit dependencies are installed!"
fi

# Check problematic environment variables
print_info "Checking environment variables..."

if [ ! -z "$WEBKIT_DISABLE_COMPOSITING_MODE" ]; then
    print_warning "WEBKIT_DISABLE_COMPOSITING_MODE is set: $WEBKIT_DISABLE_COMPOSITING_MODE"
fi

# Configure environment variables for WebKit stability
print_info "Setting WebKit environment variables..."

export WEBKIT_DISABLE_COMPOSITING_MODE=1
export WEBKIT_DISABLE_DMABUF_RENDERER=1
export GDK_BACKEND=x11
export WAILS_WEBVIEW2_DISABLE_COMPOSITING=1

print_success "Environment variables configured:"
echo "  WEBKIT_DISABLE_COMPOSITING_MODE=1"
echo "  WEBKIT_DISABLE_DMABUF_RENDERER=1" 
echo "  GDK_BACKEND=x11"
echo "  WAILS_WEBVIEW2_DISABLE_COMPOSITING=1"

# Check for orphaned WebKit processes
print_info "Checking for orphaned WebKit processes..."
webkit_processes=$(pgrep -f "WebKitWebProcess" || true)
if [ ! -z "$webkit_processes" ]; then
    print_warning "WebKit processes found:"
    ps aux | grep WebKitWebProcess | grep -v grep
    print_info "To clean orphaned processes, run: pkill -f WebKitWebProcess"
else
    print_success "No orphaned WebKit processes found!"
fi

# Create development environment configuration file
print_info "Creating development environment configuration file..."

cat > dev-env.sh << 'EOF'
#!/bin/bash
# Environment settings for development with Wails

# WebKit settings to avoid issues on Linux
export WEBKIT_DISABLE_COMPOSITING_MODE=1
export WEBKIT_DISABLE_DMABUF_RENDERER=1
export GDK_BACKEND=x11
export WAILS_WEBVIEW2_DISABLE_COMPOSITING=1

# Additional debug settings
export WAILS_DEBUG=1
export WEBKIT_INSPECTOR_SERVER=127.0.0.1:9222

echo "Environment variables set for Wails development"
echo "Run: source dev-env.sh before wails dev"
EOF

chmod +x dev-env.sh
print_success "File dev-env.sh created! Run 'source dev-env.sh' before starting development."

# Show version information
print_info "System information:"
echo "  OS: $(lsb_release -d 2>/dev/null | cut -f2 || echo 'Unknown')"
echo "  Kernel: $(uname -r)"
echo "  WebKit2GTK: $(pkg-config --modversion webkit2gtk-4.0 2>/dev/null || echo 'Not found')"
echo "  GTK+: $(pkg-config --modversion gtk+-3.0 2>/dev/null || echo 'Not found')"

print_success "Check completed!"
print_info "To apply the fixes:"
print_info "1. Run: source dev-env.sh"
print_info "2. Run: wails dev"
print_info "3. If the issue persists, restart the system"

# Check for Wails updates
print_info "Checking Wails version..."
if command -v wails >/dev/null 2>&1; then
    current_wails=$(wails version 2>/dev/null | head -n1 || echo "Unknown")
    print_info "Current Wails version: $current_wails"
    print_info "To update: go install github.com/wailsapp/wails/v2/cmd/wails@latest"
else
    print_warning "Wails CLI not found! Run: go install github.com/wailsapp/wails/v2/cmd/wails@latest"
fi
