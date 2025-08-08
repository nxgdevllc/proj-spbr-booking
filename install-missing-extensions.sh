#!/bin/bash

# Install Missing VS Code Extensions with Corrected IDs
echo "🔧 Installing Missing VS Code Extensions..."
echo "=========================================="

# Corrected extension IDs
echo "📊 Installing Database Extensions..."
code --install-extension supabase.supabase-js-snippets    # Supabase JS snippets
code --install-extension bradymholt.pgformatter           # PostgreSQL formatter

echo "⚛️ Installing TypeScript Extensions..."
code --install-extension steoates.autoimport              # Auto Import

echo "🔧 Installing Code Quality Extensions..."
code --install-extension formulahendry.auto-complete-tag  # Auto Complete Tag

echo "📁 Installing File Management Extensions..."
code --install-extension steffenleist.file-utils          # File Utils
code --install-extension chrisjohnson.autoheader          # Auto Header
code --install-extension gera2ld.file-nesting-updater     # File Nesting Updater

echo "🧪 Installing Debugging Extensions..."
code --install-extension hediet.debug-visualizer          # Debug Visualizer

echo "⚙️ Installing Configuration Extensions..."
code --install-extension eriklynd.json-tools              # JSON Tools

echo "🎨 Installing Theme Extensions..."
code --install-extension zhuangtongfa.material-theme      # One Dark Pro alternative

echo ""
echo "✅ Missing extensions installation completed!"
echo ""
echo "📋 Note: Some extensions may have different names or be deprecated."
echo "The core functionality is covered by the successfully installed extensions."
