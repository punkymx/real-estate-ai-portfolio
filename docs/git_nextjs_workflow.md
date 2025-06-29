# Git + Next.js Project Workflow Documentation
## 📦 Check Tool Versions (Dev Environment)

```bash
node -v                  # Node.js version
npm -v                   # npm version
npx -v                   # npx version
npx next --version       # Next.js version
npx tailwindcss --version   # Tailwind CSS version
npx eslint --version     # ESLint version

npm list --depth=0       # List project dependencies and versions
npm outdated             # Show available updates

🧼 Manual Cleanup: Removing Extraneous Packages from node_modules

If npm list --depth=0 shows packages marked as extraneous even after running npm uninstall, follow these steps:

# 1. Manually delete the affected package folders ( example)
cd node_modules
rm -rf @emnapi @napi-rs @tybys

# 2. Delete package-lock.json (optional but recommended)
cd ..
rm package-lock.json

# 3. Reinstall only what's declared in package.json
npm install

# 4. Verify again
npm list --depth=0

This ensures your project only contains necessary dependencies.



## ✨ Initial Project Setup

### 1. Create a New Project (Optional)

```bash
cd "C:/Users/Support"
npx create-next-app@latest "real-estate-ai-portfolio"
cd "real-estate-ai-portfolio"
```

### 2. Initialize Git and Configure Identity

```bash
# Initialize Git repository
git init

# Set global Git user identity
git config --global user.name "Miguel Colli"
git config --global user.email "coqm86@gmail.com"

# Link to remote GitHub repository
git remote add origin https://github.com/punkymx/real-estate-ai-portfolio.git
```

### 3. Push Initial Code to GitHub

```bash
# Stage all files
git add .

# Commit with a message
git commit -m "Initial commit - Next.js base project"

# Set branch name to main (if needed)
git branch -M main

# Push to GitHub
git push --set-upstream origin main
```

### 4. Alternative: Cloning From GitHub

```bash
# (Optional) Delete previous folder if needed
cd ..
rm -r "Real Estate Ai Portfolio"

# Clone repository from GitHub
git clone https://github.com/punkymx/real-estate-ai-portfolio.git
cd real-estate-ai-portfolio
```

---

## 🔧 Common Git Commands

```bash
git status              # Show working tree status
git log --oneline       # Show short commit history
git pull origin main    # Pull changes from remote
git push origin main    # Push changes to remote
```

### Rewriting Commit History (Optional)

```bash
git rebase -i HEAD~3        # Edit last 3 commits
git rebase --continue       # Continue after editing

# Push rebased commits
git push origin main --force   # Use with caution
```

---

## 📁 Project Folder Structure (Recommended)

```plaintext
/src
├── app/                 # Routing system (Next.js App Router)
│   └── page.tsx         # Home page
├── components/          # Reusable UI components
├── features/            # Domain-specific modules (e.g., properties, auth)
├── lib/                 # Utilities and helpers
├── styles/              # Tailwind or global styles
├── data/                # Local/static test data
├── agents/              # AI-related logic (description generators, etc.)
└── types/               # TypeScript type definitions
```

### Create Folder Structure via Terminal

```bash
mkdir -p src/app/properties
mkdir -p src/components src/features src/lib src/data src/agents src/types src/styles
```

### Optional: Add README placeholders

```bash
touch src/app/properties/page.js
touch src/components/README.md
... (repeat for each folder)
```

---

## 🚀 Run the Development Server

```bash
# Install dependencies (first time only)
npm install

# Run the dev server (default port 3000)
npm run dev

# If port 3000 is busy:
PORT=4000 npm run dev  # Works in Git Bash / MINGW64
```

Visit: http\://localhost:4000 or your chosen port.

---



