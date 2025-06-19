
# ⚙️ Project Setup – create-next-app Configuration Summary

This document summarizes the configuration choices made when initializing the Next.js project using `create-next-app`.

---

## ✅ Configuration Choices

| Question                                                    | Answer      | Notes                                                                 |
|-------------------------------------------------------------|-------------|-----------------------------------------------------------------------|
| Would you like to use TypeScript?                          | No (`n`)    | Easier to start with JavaScript; migration to TS possible later       |
| Would you like to use ESLint?                              | Yes (`y`)   | Recommended for clean, consistent code                                |
| Would you like to use Tailwind CSS?                        | Yes (`y`)   | Ideal for modern, responsive UI design                                |
| Would you like to use the `src/` directory?                | Yes (`y`)   | Improves project structure and scalability                            |
| Would you like to use the App Router?                      | Yes (`y`)   | Modern routing system (Next.js 13+), supports layouts and async flows |
| Would you like to use Turbopack as the bundler?            | No (`n`)    | Still experimental; Webpack chosen for stability                      |
| Would you like to customize the default import alias?      | No (`n`)    | Default alias `@/` is ideal for cleaner imports from `/src`           |

---

## 📝 Notes

- These settings are optimized for individual development and portfolio use.
- You can always enable TypeScript or Turbopack later as your needs evolve.
