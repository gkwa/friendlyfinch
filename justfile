# List all available recipes
default:
    @just --list

# Setup project dependencies
setup:
    pnpm install

# Run tests
test:
    pnpm test

# Run the development server
dev:
    pnpm dev

# Build the project
build:
    pnpm build

# Clean up build artifacts
teardown:
    rm -rf dist
    rm -rf node_modules
