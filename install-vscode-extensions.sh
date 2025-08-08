#!/bin/bash

# VS Code Extensions Installation Script for San Pedro Beach Resort Project
# This script installs all recommended extensions for maximum workflow automation

echo "🚀 Installing VS Code Extensions for San Pedro Beach Resort Project..."
echo "================================================================"

# Database & PostgreSQL/Supabase Extensions
echo "📊 Installing Database & PostgreSQL/Supabase Extensions..."
code --install-extension ms-mssql.mssql                    # PostgreSQL by Microsoft
code --install-extension supabase.supabase                # Supabase integration
code --install-extension mtxr.sqltools                    # SQLTools
code --install-extension mtxr.sqltools-driver-pg          # SQLTools PostgreSQL Driver
code --install-extension cweijan.vscode-database-client2  # Database Client

# TypeScript & React/Next.js Extensions
echo "⚛️ Installing TypeScript & React/Next.js Extensions..."
code --install-extension pmneo.tsimporter                 # TypeScript Importer
code --install-extension formulahendry.auto-rename-tag    # Auto Rename Tag
code --install-extension dsznajder.es7-react-js-snippets  # ES7+ React/Redux snippets
code --install-extension bradlc.vscode-tailwindcss        # Tailwind CSS IntelliSense
code --install-extension pulkitgangwar.nextjs-snippets    # Next.js Snippets

# Code Quality & Automation Extensions
echo "🔧 Installing Code Quality & Automation Extensions..."
code --install-extension dbaeumer.vscode-eslint           # ESLint
code --install-extension esbenp.prettier-vscode          # Prettier
code --install-extension usernamehw.errorlens            # Error Lens
code --install-extension eamodio.gitlens                 # GitLens
code --install-extension formulahendry.auto-close-tag    # Auto Close Tag
code --install-extension formulahendry.auto-complete-tag # Auto Complete Tag
code --install-extension CoenraadS.bracket-pair-colorizer-2 # Bracket Pair Colorizer
code --install-extension christian-kohler.path-intellisense # Path Intellisense

# Database Schema & Migration Extensions
echo "🗄️ Installing Database Schema & Migration Extensions..."
code --install-extension adpyke.vscode-sql-formatter      # SQL Formatter
code --install-extension cweijan.vscode-database-client2  # Database Schema Viewer

# CSV & Data Import/Export Extensions
echo "📈 Installing CSV & Data Import/Export Extensions..."
code --install-extension mechatroner.rainbow-csv         # Rainbow CSV
code --install-extension janisdd.vscode-edit-csv         # Edit csv
code --install-extension GrapeCity.gc-excelviewer        # Excel Viewer

# File Management & Navigation Extensions
echo "📁 Installing File Management & Navigation Extensions..."
code --install-extension SteffenLeist.file-utils         # File Utils
code --install-extension alefragnani.project-manager     # Project Manager
code --install-extension chrisjohnson.autoheader         # Auto Header
code --install-extension gera2ld.file-nesting-updater    # File Nesting Updater

# Testing & Debugging Extensions
echo "🧪 Installing Testing & Debugging Extensions..."
code --install-extension rangav.vscode-thunder-client    # Thunder Client
code --install-extension humao.rest-client               # REST Client
code --install-extension hediet.debug-visualizer         # Debug Visualizer

# Productivity & Workflow Extensions
echo "⚡ Installing Productivity & Workflow Extensions..."
code --install-extension streetsidesoftware.code-spell-checker # Code Spell Checker
code --install-extension Gruntfuggly.todo-tree           # Todo Tree
code --install-extension alefragnani.Bookmarks           # Bookmarks
code --install-extension oderwat.indent-rainbow          # Indent Rainbow
code --install-extension aaron-bond.better-comments      # Better Comments
code --install-extension donjayamanne.githistory        # Git History
code --install-extension mhutchie.git-graph              # Git Graph

# Environment & Configuration Extensions
echo "⚙️ Installing Environment & Configuration Extensions..."
code --install-extension mikestead.dotenv                # DotENV
code --install-extension redhat.vscode-yaml              # YAML
code --install-extension eriklynd.json-tools             # JSON Tools

# Theme & Icons (Optional but Recommended)
echo "🎨 Installing Theme & Icons Extensions..."
code --install-extension PKief.material-icon-theme       # Material Icon Theme
code --install-extension binaryify.one-dark-pro          # One Dark Pro
code --install-extension dracula-theme.theme-dracula     # Dracula Official

echo ""
echo "✅ All VS Code extensions have been installed!"
echo ""
echo "🎯 Next Steps:"
echo "1. Restart VS Code to ensure all extensions are loaded"
echo "2. Configure your Supabase connection in SQLTools"
echo "3. Set up your preferred theme and icon pack"
echo "4. Configure Prettier and ESLint settings"
echo ""
echo "📋 Configuration Tips:"
echo "- Enable 'Format on Save' in VS Code settings"
echo "- Set Prettier as default formatter"
echo "- Configure Tailwind CSS IntelliSense for TypeScript"
echo "- Set up your Supabase connection in SQLTools"
echo ""
echo "🚀 Your development environment is now optimized for the San Pedro Beach Resort project!"
