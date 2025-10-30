## Purpose

Short, action-oriented guidance for AI coding agents working in this repository (TREEVÜT). Focus on what to change, where to look, and project-specific patterns to avoid mistakes.

## How to run (developer workflows)

- Install deps: `npm install`.
- Dev server: `npm run dev` (Vite on port 3000). See `package.json` scripts.
- Build: `npm run build`. Preview production build: `npm run preview`.
- Environment: set `GEMINI_API_KEY` in a `.env.local` at project root. Vite maps this to `process.env.API_KEY` / `process.env.GEMINI_API_KEY` in `vite.config.ts`.

## Testing workflows

- Unit tests: `npm test` (or `npm run test -- --run` for CI mode)
- Watch mode: `npm run test:watch`
- Coverage: `npm run test:coverage`
- Accessibility tests: `npm run test:a11y`
- Performance tests: `npm run test:perf`

Performance tests verify:
- Render times (<100ms target)
- Memory leaks (<1MB delta)
- Memoization effectiveness
- Lazy loading behavior

## Quick verification (local)

Two options for running verification:

1. With Node.js installed locally:
   ```bash
   npm install          # Install dependencies
   npx tsc --noEmit    # Run TypeScript check
   npm run build       # Run build check
   ```

2. Using Docker (if Node.js not installed):
   ```bash
   # Pull and run Node.js container
   docker pull node:24-alpine
   docker run -it --rm -v ${PWD}:/app -w /app node:24-alpine sh

   # Inside container
   npm install
   npx tsc --noEmit
   npm run build
   exit
   ```

The project uses TypeScript with `noEmit` in `tsconfig.json`. Both approaches will catch type errors and build issues.

## Big-picture architecture (what matters)

- Frontend single-page app built with React + Vite. Entry: `index.tsx` -> `App.tsx`.
- `App.tsx` composes global providers: `AuthProvider` and `DataProvider` (see `contexts/AuthContext.tsx` and `contexts/DataContext.tsx`), then renders `components/AppRouter.tsx`.
- UI lives in `components/` — mostly presentational + small container hooks. Business logic and integrations live in `services/`.

### Performance architecture

Optimizations:
- Code-splitting via React.lazy() for routes (`AppRouter.tsx`)
- Strategic chunk preloading (see `preloadCriticalChunks` in `AppRouter.tsx`)
- Manual chunks in `vite.config.ts`:
  - vendor: react, react-dom, @google/genai
  - core: Header, ActionButtons, WalletView
  - analysis: Charts, Analytics components
  - ai-features: AIAssistantChat, geminiService
  - expense-management: Modals, Cards, taxService
  - auth: Welcome, ProfileSetup, AuthContext
- Image optimization with vite-plugin-imagemin (see config in `vite.config.ts`)
- CSS optimization with lightningcss
- Development code stripping (console.logs via rollup-plugin-strip)
- Tree-shaking with advanced settings (see rollupOptions in `vite.config.ts`)
- Small asset inlining (<4KB)

Bundle sizes (after all optimizations):
- Initial: 393.78 KB (gzip: 98.61 KB)
- vendor.js: 209.77 KB (gzip: 40.39 KB)
- index.js: 184.01 KB (gzip: 58.22 KB)
- components.js: 33.85 KB (gzip: 9.98 KB)
- services.js: 24.43 KB (gzip: 8.67 KB)

Browser requirements:
- Modern browser with ES2022 support (see `tsconfig.json`)
- localStorage API for data persistence (expenses, budget, settings)
- Service Workers API for notifications (`notificationService.ts`)
- Canvas API for image processing (receipt/document scanning)
- Secure context (HTTPS) for Gemini API calls

Important boundaries:

- services/*: contains AI + domain logic (not UI). Example: `services/geminiService.ts` encapsulates all Gemini interactions and JSON-schema prompts.
- contexts/*: single source of truth for auth/data. Use `useAuth()` and `useData()` helpers to access state instead of reaching into localStorage or global variables.

## Project-specific patterns

- UI Framework:
  - Uses Tailwind CSS (via CDN) for styling. See `className` patterns in components.
  - Components use consistent animation classes (`animate-fade-in`, `animate-slide-in-up`).
  - Consistent color tokens (`bg-surface`, `text-on-surface`, `text-primary`).

- AI integration is centralized in `services/geminiService.ts`:
  - Use `@google/genai` client with `ai.models.generateContent`.
  - Responses wrapped in markdown; parse with `utils.parseJsonFromMarkdown`.
  - Follow schema-config pattern (see `expenseSchema`, `verificationSchema`).
  - Model choices: `gemini-2.5-flash`, `responseSchema`, `responseMimeType: "application/json"`.

- Error handling patterns:
  - Services catch and log errors but provide fallbacks (see error handlers in `geminiService.ts`).
  - UI components handle loading/error states with skeleton loaders (see `animate-pulse` usage).
  - Notifications and browser APIs have graceful degradation.

## Data & domain conventions to preserve

- Language and domain: UI and prompts are Spanish and tailored to Peruvian tax rules (SUNAT). Examples: `CategoriaGasto`, `TipoComprobante`, `esFormal` logic in `services/geminiService.ts`.
- Deduction logic is in `services/taxService.ts` (constants like `DEDUCTIBLE_CATEGORIES`, `DEDUCTIBLE_TRANSACTION_RATE`). When changing classification logic, update both `geminiService` and `taxService` to keep behavior consistent.
- Types are centralized in `types.ts`. Use these types for function signatures to avoid mismatches (e.g., `ExpenseData`, `Product`, `VerificationResult`).

## Files/directories to check for common edits

- AI + parsing: `services/geminiService.ts`, `utils.ts` (contains `parseJsonFromMarkdown`).
- Domain rules and constants: `services/taxService.ts` and `types.ts`.
- App wiring and providers: `App.tsx`, `contexts/*`.
- Routing and per-page components: `components/AppRouter.tsx`, `components/*` (e.g., `Header.tsx` shows how `getAIEducationalTip` and `getAINextStepTip` are used).

## Examples from the codebase (copy/paste patterns)

Call Gemini and expect JSON schema:
```ts
// services/geminiService.ts
ai.models.generateContent({
  config: { 
    responseMimeType: "application/json", 
    responseSchema: mySchema 
  }
})
```

Parse JSON from AI output:
```ts
const raw = parseJsonFromMarkdown<T>(response.text);
```

Access providers in components:
```tsx
const { user } = useAuth(); // from contexts/AuthContext.tsx
const { expenses } = useData(); // from contexts/DataContext.tsx
```

Performance test patterns:
```tsx
// __tests__/performance.test.tsx
it('renders efficiently', () => {
  const startTime = performance.now();
  render(<Component />);
  const endTime = performance.now();
  expect(endTime - startTime).toBeLessThan(100);
});

it('memoization works', () => {
  const renderSpy = vi.fn();
  const { rerender } = render(<Component />);
  rerender(<Component />);
  expect(renderSpy).toHaveBeenCalledTimes(1);
});
```

## Environment and secrets

- Required: Create `.env.local` at project root with:
  ```bash
  # Get an API key from https://ai.google.dev/
  # Warning: Replace the placeholder value with a real API key
  GEMINI_API_KEY=your-key-here...
  ```
- The `vite.config.ts` maps this into both `process.env.API_KEY` and `process.env.GEMINI_API_KEY` (some services use `API_KEY`, others use the full name).
- For CI/deployment: Set `GEMINI_API_KEY` in the environment. Check both vars are exposed since the codebase uses both forms.
- Note: The app won't function correctly with the placeholder API key. Get a real key from https://ai.google.dev/ before starting development.

## Common pitfalls for AI agents to avoid

- Don't change prompt schemas or `responseSchema` without updating the TypeScript types in `types.ts` and the parsing logic in `utils.ts`.
- Avoid adding new UI text in English—most UX is Spanish and some model prompts assume Spanish.
- Don't hardcode API keys; use `.env.local` and Vite env mappings.
- When adding/modifying performance-sensitive components, ensure they:
  1. Are properly memoized (use React.memo for functional components)
  2. Have render time tests in `__tests__/performance.test.tsx`
  3. Follow the chunk structure in `vite.config.ts` manual chunks
  4. Use lazy loading for non-critical features

## If you need to modify AI prompts

- Keep prompts small and deterministic. Follow existing pattern: define a JSON schema for responses, use `responseMimeType: "application/json"`, and validate the parsed object before returning it to UI code.

---
If anything above is unclear or you want me to expand any section (examples, CI steps, or merge an existing instruction file), tell me which part and I'll iterate.
