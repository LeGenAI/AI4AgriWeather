#!/bin/bash

echo "=== Railway Build Script ==="
echo "Current directory: $(pwd)"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

echo ""
echo "=== Environment Variables ==="
echo "All VITE_ variables:"
env | grep VITE_ || echo "No VITE_ variables found!"

echo ""
echo "=== Building Application ==="
npm run build

echo ""
echo "=== Build Complete ==="
echo "Checking dist directory:"
ls -la dist/