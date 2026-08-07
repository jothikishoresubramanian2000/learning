# Frontend Roadmap (0 → Master)

> **For Kishore — start AFTER the backend roadmap.** You'll already know JS + TS deeply,
> so this skips language fundamentals and focuses on **frontend-specific** skills.
> Target stack mirrors procIq's `apps/compass`: **React + Vite + TypeScript + TailwindCSS +
> shadcn/Radix + React Query + Zustand + React Router**. Angular is a second framework.
>
> Same method as the backend roadmap: **every module is broken into atomic sub-topics**,
> done one at a time, no skipping. Each module → concept + example + task + review.

---

## Phase 1 — HTML

### Module 1 — HTML Basics
- What HTML is; how the browser parses HTML → the DOM tree
- Document structure: `<!DOCTYPE>`, `<html>`, `<head>`, `<body>`
- Elements, tags, attributes, nesting
- Comments, whitespace, how the browser renders top-to-bottom

### Module 2 — Text & Content
- Headings `h1`–`h6`, paragraphs, `span`, `br`, `hr`
- Lists: `ul`, `ol`, `li`, `dl`
- Links `a` (href, target, relative vs absolute)
- Images `img` (src, alt, loading), `figure`/`figcaption`
- Text formatting: `strong`, `em`, `b`, `i`, `code`, `pre`

### Module 3 — Semantic HTML
- Why semantics (accessibility + SEO + readability)
- `header`, `nav`, `main`, `section`, `article`, `aside`, `footer`
- `div` vs `span` vs semantic tags — when to use which

### Module 4 — Forms
- `form`, `action`, `method`
- `input` types (text, email, password, number, checkbox, radio, date, file...)
- `label` (and why it matters), `placeholder`, `name`, `value`
- `select`/`option`, `textarea`, `button` (type submit/button)
- `required`, `min`/`max`, `pattern` (native validation)
- `fieldset`, `legend`

### Module 5 — Tables & Media
- `table`, `thead`, `tbody`, `tr`, `th`, `td`
- `audio`, `video`, `iframe`
- `details`/`summary`

### Module 6 — Attributes & Metadata
- Global attributes: `id`, `class`, `data-*`, `title`, `hidden`
- `<meta>` (charset, viewport, description), favicon, Open Graph
- `<link>`, `<script>` placement (head vs end of body)

### Module 7 — Accessibility (a11y) Basics
- Alt text, labels, semantic tags
- `aria-*` attributes, roles, keyboard navigation, focus order
- Why a11y matters (legal + UX + everyone benefits)

---

## Phase 2 — CSS

### Module 8 — CSS Basics
- How CSS attaches (inline, internal, external), syntax
- Selectors: element, class, id, grouping, descendant
- The cascade, specificity, `!important`, inheritance

### Module 9 — Selectors Deep
- Attribute selectors, pseudo-classes (`:hover`, `:focus`, `:nth-child`, `:not`)
- Pseudo-elements (`::before`, `::after`)
- Combinators (`>`, `+`, `~`)

### Module 10 — Box Model
- content / padding / border / margin
- `box-sizing: border-box`
- Margin collapse, overflow

### Module 11 — Units & Colors & Typography
- Units: `px`, `rem`, `em`, `%`, `vw`/`vh`, `ch`
- Colors: hex, rgb, hsl, opacity
- Fonts: `font-family`, web fonts, `font-size`, `line-height`, `font-weight`
- Text: align, decoration, transform, spacing

### Module 12 — Flexbox ⭐
- `display: flex`, main vs cross axis
- `justify-content`, `align-items`, `align-self`
- `flex-direction`, `flex-wrap`, `gap`
- `flex-grow`/`shrink`/`basis`, `flex` shorthand

### Module 13 — CSS Grid ⭐
- `display: grid`, `grid-template-columns/rows`, `fr`
- `gap`, `grid-template-areas`
- Placement: `grid-column`, `grid-row`, spanning
- `repeat()`, `minmax()`, `auto-fit`/`auto-fill`

### Module 14 — Positioning
- `static`, `relative`, `absolute`, `fixed`, `sticky`
- `top/right/bottom/left`, `z-index`, stacking context
- `display`: block/inline/inline-block/none

### Module 15 — Responsive Design ⭐
- Media queries, breakpoints, mobile-first
- Fluid layouts, `clamp()`, `min()`, `max()`
- Responsive images (`srcset`, `sizes`)

### Module 16 — Transitions & Animations
- `transition` (property, duration, easing)
- `transform` (translate, scale, rotate, skew)
- `@keyframes` + `animation`

### Module 17 — Modern CSS
- Custom properties (variables `--x`), `calc()`
- `object-fit`, aspect-ratio, gradients, shadows, filters
- Logical properties, container queries (awareness)

---

## Phase 3 — DOM & Browser (JS you mostly know)

### Module 18 — DOM Manipulation
- The DOM tree; `querySelector`/`querySelectorAll`
- `textContent`, `innerHTML`, `classList`, `setAttribute`, `style`
- Create/insert/remove: `createElement`, `append`, `remove`, `replaceWith`

### Module 19 — Events
- `addEventListener`, the event object
- `preventDefault`, `stopPropagation`
- Bubbling, capturing, event delegation
- Form events: `submit`, `input`, `change`

### Module 20 — Fetch & Storage
- `fetch` + async/await (call YOUR Phase-3 backend API)
- Request/response, headers, JSON, error handling
- `localStorage` / `sessionStorage` / cookies (ties to JWT work)

### Module 21 — Browser APIs
- `location`, `history`, `URLSearchParams`
- `IntersectionObserver` (lazy load / infinite scroll)
- `setTimeout`/`setInterval` (known), `requestAnimationFrame`

---

## Phase 4 — React Core

### Module 22 — React & Vite Setup
- What React is, why (component model, virtual DOM, declarative)
- **Vite** project setup, structure, dev server, HMR
- `main.tsx`, root render, StrictMode

### Module 23 — JSX
- JSX syntax, expressions `{}`, attributes
- Conditional rendering (`&&`, ternary)
- Lists + `key`, fragments
- JSX gotchas (className, camelCase, self-closing)

### Module 24 — Components & Props
- Function components, composition
- Props (passing, destructuring, default, children)
- One-way data flow, component tree

### Module 25 — State: `useState`
- What state is, re-rendering
- `useState` (read/set), updater function
- State with objects/arrays (immutability!)
- Multiple state vs one object

### Module 26 — `useEffect`
- Side effects, when it runs
- Dependency array (empty, none, with deps)
- Cleanup functions
- Common pitfalls (infinite loops, stale closures)

### Module 27 — More Hooks
- `useRef` (DOM access, mutable value)
- `useMemo` / `useCallback` (memoization — and when NOT to)
- `useContext` (avoid prop-drilling)
- `useReducer` (complex state)

### Module 28 — Custom Hooks
- Extracting reusable logic
- Rules of hooks
- Common patterns (`useFetch`, `useToggle`, `useLocalStorage`)

### Module 29 — Forms in React
- Controlled vs uncontrolled inputs
- Handling multiple inputs, submit
- `react-hook-form` (procIq uses it) + validation
- Zod for schema validation

### Module 30 — Lists, Conditionals, Composition
- Rendering lists, keys deep
- Conditional UI patterns
- Composition, `children`, render props
- Error boundaries

---

## Phase 5 — React Ecosystem

### Module 31 — React Router
- Routes, `Link`, `NavLink`, nested routes, `Outlet`
- Route params, query params
- Programmatic navigation, redirects
- Protected routes / guards (ties to your auth work)

### Module 32 — Data Fetching (TanStack/React Query) ⭐
- Why (replaces manual `useEffect` fetching)
- `useQuery` (fetch, cache, loading/error)
- `useMutation` (create/update/delete)
- Cache invalidation, refetch, optimistic updates
- procIq uses this heavily

### Module 33 — HTTP with Axios
- `axios` instance, base URL, interceptors
- Auth headers / cookies (`withCredentials` — your JWT cookies!)
- Error handling, request/response transforms

### Module 34 — Global State (Zustand)
- When you need global state (vs Context vs Query)
- Zustand stores, actions, selectors
- procIq uses Zustand

### Module 35 — i18n
- `i18next` / `react-i18next`
- Translation files, switching languages, interpolation

---

## Phase 6 — Styling Systems (procIq's exact approach)

### Module 36 — TailwindCSS ⭐
- Utility-first philosophy, setup, config
- Spacing, colors, typography, flex/grid utilities
- Responsive prefixes, hover/focus states, dark mode
- `@apply`, extending the theme

### Module 37 — Conditional Classes
- `clsx`, `tailwind-merge`, `class-variance-authority` (procIq uses all)
- Building variant-based components (button sizes/colors)

### Module 38 — Radix UI + shadcn/ui ⭐
- Radix — unstyled accessible primitives (dialog, dropdown, tooltip, popover)
- **shadcn/ui** — copy-paste components on Radix + Tailwind (you OWN the code)
- `lucide-react` icons
- Building a component library (button, input, dialog, table, toast)

### Module 39 — Theming & Design Systems
- Design tokens, CSS variables theming
- Light/dark mode, consistency
- Component API design (props, composition)

---

## Phase 7 — TypeScript + React

### Module 40 — Typing Components
- Typing props, `children`, default props
- Typing events, refs (`useRef<T>`)
- Typing `useState<T>`, custom hooks

### Module 41 — Advanced React + TS
- Generic components
- Typing API responses + forms
- Utility types in components (`Partial`, `Pick`, `Omit`, `Record`)
> procIq's frontend is fully typed — this is the norm.

---

## Phase 8 — Tooling, Testing, Quality

### Module 42 — Vite & Config
- Build, env vars, path aliases, plugins
- Code splitting, `React.lazy`, `Suspense`

### Module 43 — Linting & Formatting
- ESLint + Prettier (procIq uses both), rules, auto-fix

### Module 44 — Testing
- Vitest / Jest + React Testing Library
- Component tests, `user-event`, queries
- Mocking API calls
- E2E awareness (Playwright/Cypress)

### Module 45 — Performance & a11y
- Rendering optimization, memoization, virtualization (`react-window`)
- Core Web Vitals, Lighthouse
- Accessibility auditing, focus management

---

## Phase 9 — Angular (second framework)

### Module 46 — Angular Fundamentals
- Why Angular vs React (full framework, opinionated, TS-first)
- CLI, project structure, modules, components

### Module 47 — Templates & Binding
- Interpolation, property binding, event binding, two-way (`ngModel`)
- Directives: `*ngIf`, `*ngFor`, `*ngSwitch`, custom directives
- Pipes

### Module 48 — Services & DI
- Services, **Dependency Injection** (you know DI from BE!)
- Providers, injection scopes

### Module 49 — RxJS & Observables
- Observables vs Promises (Angular's async model)
- Operators (`map`, `filter`, `switchMap`), subscriptions
- `async` pipe

### Module 50 — Routing & Forms
- Router, guards, lazy loading
- Reactive Forms + validation
- HttpClient, interceptors

### Module 51 — Modern Angular
- **Signals** (new reactivity model)
- Standalone components
- State (NgRx awareness), Angular Material

---

## Phase 10 — Master Level

### Module 52 — Next.js (React meta-framework)
- SSR / SSG / RSC (server components)
- File-based routing, data fetching, SEO
- When to use Next vs plain React+Vite

### Module 53 — Real-time UI
- WebSockets in the frontend (socket.io — procIq uses it)
- Live updates, pairing with your BE gateway

### Module 54 — Architecture & Scale
- Feature-folder structure, design systems
- Monorepos (**Nx** — procIq uses it!)
- Micro-frontends (awareness)

### Module 55 — Advanced Polish
- Animation (Framer Motion)
- PWA, offline, service workers
- Deployment (Vercel/Netlify/CloudFront — procIq uses CloudFront)
- CI/CD for frontend

---

## Suggested order

```
HTML (1-7) → CSS (8-17) → DOM/JS (18-21)          the platform
  → React core (22-30) → ecosystem (31-35)         procIq's stack
  → styling: Tailwind/shadcn (36-39)
  → TS+React (40-41) → tooling/testing (42-45)      production quality
  → Angular (46-51)                                 second framework
  → master: Next.js, real-time, Nx (52-55)
```

**Timeline (2 hrs/day):** ~90–110 days to strong intermediate across React + Angular.
React alone (employable): ~50–60 days (Modules 1-45).

## Connects to your backend work
- You built the **API** these frontends call (BE Phase 3).
- **Axios + JWT cookies** ← your auth/JWT projects.
- **DI in Angular** ← the pattern from Project 8.
- **socket.io UI** ← procIq's WebSocket gateway (BE Phase 5).
- **Nx monorepo + CloudFront** ← same infra as procIq.
> Both roadmaps done = full-stack: you can build AND consume procIq end-to-end.

## Prerequisite
Do the **backend roadmap first** (at least through TypeScript). You reuse JS mastery, TS,
async/await, JSON, HTTP/REST, and the API you built — making this track much faster.
