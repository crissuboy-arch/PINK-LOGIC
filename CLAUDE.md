# CLAUDE.md — PinkLogic / VitrinePro Guidelines

## Build and Run Commands
- Dev Server: `npm run dev` (Vite)
- Build: `npm run build` (TypeScript check & Vite build)
- Lint: `npm run lint` (ESLint)
- Preview: `npm run preview`

## Project Guidelines
- **No Direct Deployments**: Do NOT deploy or trigger a ship/deploy command that performs deployment without explicit user approval.
- Keep comments and docstrings intact unless specifically requested.
- Use TypeScript type-safety (React 19).

## gstack
Use /browse from gstack for all web browsing. Never use mcp__claude-in-chrome__* tools.
Available skills: /office-hours, /plan-ceo-review, /plan-eng-review, /plan-design-review, /design-consultation, /design-shotgun, /design-html, /review, /ship, /land-and-deploy, /canary, /benchmark, /browse, /open-gstack-browser, /qa, /qa-only, /design-review, /setup-browser-cookies, /setup-deploy, /setup-gbrain, /sync-gbrain, /retro, /investigate, /document-release, /document-generate, /codex, /cso, /autoplan, /pair-agent, /careful, /freeze, /guard, /unfreeze, /gstack-upgrade, /learn.

## VitrinePro / PinkLogic Execution Rules
- **Analyze project**: Use `/autoplan` to analyze the project.
- **Find bugs**: Use `/review` to find bugs.
- **QA/Testing**: Use `/qa` to test the production or staging URLs.
- **No Deployment**: Do not execute deployments or deploy steps without user approval (the user handles deployment directly).
