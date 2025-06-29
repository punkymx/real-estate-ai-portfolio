# 🌿 Git Branching Workflow for Portfolio Projects

This document outlines best practices and common commands for working with branches in a Next.js-based portfolio project using Git and GitHub.

---

## ✅ Branch Naming Conventions

| Branch Type   | Format                        | Purpose                                        |
|---------------|-------------------------------|------------------------------------------------|
| Main branch   | `main`                        | Stable, production-ready code                 |
| Feature       | `feature/your-feature-name`   | New UI, functionality, modules                |
| Bug fix       | `fix/bug-description`         | Fixing specific bugs                          |
| Hotfix        | `hotfix/critical-fix`         | Emergency fix for a deployed version          |
| Release       | `release/v1.0.0`              | Preparing a version for deployment or review  |

---

## 🧱 Creating and Using Branches

### 1. Create a new branch from `main`
```bash
git checkout main
git pull origin main     # make sure it's up to date
git checkout -b feature/property-catalog
```

### 2. Make changes and commit
```bash
git add .
git commit -m "feat: add property catalog section"
```

### 3. Push the branch to GitHub
```bash
git push -u origin feature/property-catalog
```

### 4. Merge to main (local)
```bash
git checkout main
git pull origin main     # always sync first
git merge feature/property-catalog

# Push merged changes
git push origin main
```

### 5. (Alternative) Merge via Pull Request on GitHub
- Create a Pull Request from `feature/...` to `main`
- Review and approve changes
- Merge via the GitHub UI

---

## 🔍 Check local and remote branches
```bash
git branch         # local branches
git branch -r      # remote branches
```

---

## 🗑️ Delete branches after merging (optional but clean)

### Delete locally:
```bash
git branch -d feature/property-catalog
```

### Delete remotely:
```bash
git push origin --delete feature/property-catalog
```

---

## 📌 Summary

- Branching helps you organize your work, isolate features, and avoid breaking main.
- Use descriptive branch names like `feature/contact-form` or `fix/header-layout`.
- Always pull before merging or creating new branches.
- Push only the branches you want to share with GitHub.

---

Keep your project clean, professional, and easy to collaborate on.

