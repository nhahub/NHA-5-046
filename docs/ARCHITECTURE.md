# WorkTech front-end architecture

This guide explains how the code is organised and the rules every pull request must follow. If a rule here and the code disagree, the rule wins and the code should be fixed.

## 1. Principles

1. **Feature-first.** Code is grouped by business domain (`cart`, `catalog`, `auth` ...), not by file type. Most of the work on the cart happens inside `src/features/cart`.
2. **Thin pages.** A page only arranges feature components for one route. Pages hold no business logic, data fetching or Redux code.
3. **One direction of dependencies.** Higher layers may use lower layers, never the other way round. ESLint enforces this.
4. **Public API per feature.** Each feature exports what others may use from its `index.js`. Everything else in the folder is private.
5. **Server state is not client state.** Data from the API is fetched with hooks and is never copied into Redux. Redux holds only `cart`, `wishlist`, `compare` and `auth`.
6. **One source of truth.** Routes live in `app/router/paths.js`, environment access in `shared/config/env.js` and HTTP in `services/api/apiClient.js`. Nobody hard-codes a path, reads `import.meta.env` or calls `axios` directly anywhere else.
7. **i18n and RTL from day one.** No user-facing text is written inside components: it goes in the locale files and is read with `useTranslation`. Styles use CSS logical properties so the Arabic layout works without extra code.

## 2. Dependency rule

```
app  ──►  pages  ──►  features  ──►  services  ──►  shared
```

- `shared` imports nothing from the other layers.
- `services` (API client, i18n) may use `shared` only.
- A feature may use `services`, `shared` and **another feature's public API** (`@features/<name>`), never its internals.
- `pages` use features only through their public API.
- `app` wires everything together and may import from every layer.
- **One exception:** `@app/router/paths` may be imported from any layer, so that links never hard-code a URL. It holds constants only and imports nothing.

Two ESLint rules enforce this: `no-restricted-imports` for alias imports (`@features/...`) and `import-x/no-restricted-paths` for relative imports (`../../...`). Breaking the rule fails `npm run lint`, the pre-commit hook and CI.

```js
// Allowed
import { cartReducer } from '@features/cart'; // public API
import { apiClient } from '@services/api/apiClient';
import { env } from '@shared/config/env';

// Not allowed
import { cartReducer } from '@features/cart/cartSlice'; // feature internals
import { store } from '@app/store'; // from shared, features or pages: app is the top layer
import Cart from '@pages/Cart'; // from a feature: pages sit above features
```

Inside one feature, use relative imports (`./cartSlice`, `../hooks/useCart`). Between layers, always use an alias.

## 3. Folders

| Folder                          | Purpose                                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------------------------ |
| `src/app/`                      | App shell: `App.jsx`, providers, router, Redux store. The only place that wires layers together. |
| `src/app/router/`               | `paths.js` (route constants), `lazyPages.js` (lazy page imports), `routes.jsx` (route tree).     |
| `src/app/store/`                | `configureStore` and `rootReducer`. Slices come from feature public APIs.                        |
| `src/pages/<Page>/`             | One folder per route. Composes feature components. No logic.                                     |
| `src/features/<feature>/`       | A business domain: `components/`, `hooks/`, optional `api/` and slice, plus `index.js`.          |
| `src/services/api/`             | The shared axios instance (`apiClient`). Interceptors go here later.                             |
| `src/services/i18n/`            | i18next setup and the `en` / `ar` locale files.                                                  |
| `src/shared/components/ui/`     | Generic, reusable UI (Button, Input, Modal ...). No domain knowledge.                            |
| `src/shared/components/layout/` | `Layout`, `Header`, `Footer`.                                                                    |
| `src/shared/config/`            | `env.js`, the only reader of `import.meta.env`.                                                  |
| `src/shared/constants/`         | App-wide constants that are not routes.                                                          |
| `src/shared/hooks/`             | Generic hooks with no domain knowledge (`useMediaQuery`, `useDebounce` ...).                     |
| `src/shared/utils/`             | Pure helper functions (formatting, etc.).                                                        |
| `src/shared/styles/`            | `global.css`: design tokens and resets.                                                          |
| `src/shared/assets/`            | Images, icons and fonts.                                                                         |
| `src/test/`                     | Vitest setup.                                                                                    |

## 4. Where state lives

| Kind of state                                            | Where                               | Example                                 |
| -------------------------------------------------------- | ----------------------------------- | --------------------------------------- |
| Server data                                              | Feature hooks using `apiClient`     | products, product details, orders       |
| Shared client state                                      | Redux slice in the owning feature   | cart, wishlist, compare, auth user      |
| UI state used by one component                           | `useState` / `useReducer`           | open menu, form fields, active tab      |
| State that should survive a refresh or be shared by link | URL (path params and search params) | filters, sort, search, page, product id |
| State that must survive a browser restart                | `localStorage`, synced from Redux   | cart, wishlist, compare, language       |

If a value can be derived from other state, compute it instead of storing it.

## 5. Checklists

**Add a feature**

1. Create `src/features/<name>/` with `components/`, `hooks/` and, if it calls the API, `api/`.
2. Add `index.js` and export only what other layers need.
3. If it needs shared client state, add `<name>Slice.js`, export the reducer from `index.js` and register it in `src/app/store/rootReducer.js` (agree on this with the team lead first).

**Add a page**

1. Create `src/pages/<PageName>/index.jsx` with a default-exported component.
2. Import feature components from `@features/<name>` only.
3. Add the lazy import to `src/app/router/lazyPages.js`.

**Add a route**

1. Add the constant to `PATHS` in `src/app/router/paths.js` (and a helper if the path has parameters).
2. Add the route to `src/app/router/routes.jsx` as a child of `Layout`.
3. Link to it with `PATHS.X` or the helper, never a string literal.

## 6. Naming conventions

| Item                        | Convention                                                       | Example                                                       |
| --------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------- |
| Components and page folders | PascalCase folder with `index.jsx` and, later, `Name.module.css` | `ProductCard/index.jsx`, `ProductCard/ProductCard.module.css` |
| Hooks                       | `useThing.js`                                                    | `useProducts.js`                                              |
| Slices                      | `thingSlice.js`, exports `thingReducer` and actions              | `cartSlice.js`                                                |
| Utilities                   | camelCase file and function                                      | `formatPrice.js`                                              |
| Constants                   | SCREAMING_SNAKE_CASE                                             | `MAX_COMPARE_ITEMS`                                           |
| Translation keys            | `namespace:section.key`                                          | `common:header.cart`                                          |

Only React component and page files (`.jsx`) use default exports. Slices, hooks, utilities and constants (`.js`) use named exports. ESLint enforces this.

## 7. CSS conventions

- **CSS Modules** for every component: `Name.module.css` next to `index.jsx`, imported as `styles`.
- **Design tokens** (colours, spacing, radii, font sizes) are CSS variables in `shared/styles/global.css`. Components use `var(--token)`, never raw values.
- **Logical properties** for RTL: `margin-inline-start`, `padding-inline-end`, `inset-inline-start`, `text-align: start`. Do not use `left` / `right`.
- **Mobile first:** base styles target mobile (390 px), then `@media (min-width: ...)` for tablet (834 px) and desktop (1440 px).

## 8. Git workflow

- **Branches:**
  - `main` is always deployable. Nobody pushes to it directly.
  - `develop` collects every finished task. Nobody pushes to it directly.
  - Each team member has one personal branch created from `develop`, where all their work happens:

    | Member                         | Branch            |
    | ------------------------------ | ----------------- |
    | Salem Saleh                    | `dev/salem`       |
    | Abdelrahman Hany Mohamed       | `dev/abdelrahman` |
    | Fares Ahmed Mostafa Slim       | `dev/fares`       |
    | Wassim Gomaa El-Sakka          | `dev/wassim`      |
    | Zein El-Din Amr El-Sayed Ahmed | `dev/zein`        |
    | Asmaa Nehad Farouk             | `dev/asmaa`       |

- **Pull requests** go from your personal branch into `develop`, one task per PR. They use the PR template, need **one approving review** and a green CI run, and are **squash merged**.
- **After your PR is merged**, reset your branch to the new `develop` before the next task, so old commits do not come back in your next PR:

  ```bash
  git switch dev/<name>
  git fetch origin
  git reset --hard origin/develop
  git push --force-with-lease
  ```

  Only do this when everything on your branch has been merged. To pick up teammates' work in the middle of a task, run `git fetch origin` and `git merge origin/develop` instead.

- **Commits** follow [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): message`, for example `feat(cart): add quantity stepper`. Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`. commitlint rejects anything else.
- **Releases:** `develop` is merged into `main` at the end of each milestone.

### Definition of Done

A task is done when:

- it works at all three screen sizes (desktop, tablet, mobile);
- loading, empty and error states are handled;
- it works in English and Arabic (RTL);
- there are no console errors or warnings;
- lint, tests and build pass;
- it has been reviewed and approved.
