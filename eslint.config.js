import { readdirSync } from 'node:fs';

import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import importX from 'eslint-plugin-import-x';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

// Dependency rule: app -> pages -> features -> services -> shared.
// Alias imports are checked with `no-restricted-imports`, relative imports with
// `import-x/no-restricted-paths`. See docs/ARCHITECTURE.md, section 2.

const FEATURES = readdirSync(new URL('./src/features', import.meta.url), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

const src = (path) => `./src/${path}`;

// `@app/router/paths` holds route constants only and may be imported from any layer.
const restrict = {
  app: {
    regex: '^@app(?!/router/paths$)(/|$)',
    message:
      'Only src/app may import from @app (except @app/router/paths). Move shared code down a layer.',
  },
  pages: {
    regex: '^@pages(/|$)',
    message: 'Pages are route entries. Only src/app/router may import them.',
  },
  features: {
    regex: '^@features(/|$)',
    message: 'This layer sits below features and must not import from @features.',
  },
  featureInternals: {
    regex: '^@features/[^/]+/.+',
    message: "Import a feature through its public API only: '@features/<name>'.",
  },
  services: {
    regex: '^@services(/|$)',
    message: 'src/shared must not import from @services. Shared code has no app dependencies.',
  },
};

const restrictImports = (...patterns) => ({
  'no-restricted-imports': ['error', { patterns }],
});

const layerZones = [
  // Lower layers never import from higher ones.
  ...[
    ['shared', ['services', 'features', 'pages']],
    ['services', ['features', 'pages']],
    ['features', ['pages']],
  ].map(([target, from]) => ({
    target: src(target),
    from: from.map(src),
    message: `src/${target} must not import from a higher layer.`,
  })),
  // Only src/app imports from src/app, except the route constants.
  ...['shared', 'services', 'features', 'pages'].map((target) => ({
    target: src(target),
    from: src('app'),
    except: ['./router/paths.js'],
    message: `src/${target} must not import from src/app (except router/paths.js).`,
  })),
  // Features and pages reach a feature only through its public API.
  ...FEATURES.map((feature) => ({
    target: src(`features/${feature}`),
    from: src('features'),
    except: [
      `./${feature}`,
      ...FEATURES.filter((other) => other !== feature).map((other) => `./${other}/index.js`),
    ],
    message: "Import other features through their public API: '@features/<name>'.",
  })),
  {
    target: src('pages'),
    from: src('features'),
    except: FEATURES.map((feature) => `./${feature}/index.js`),
    message: "Pages import features through their public API only: '@features/<name>'.",
  },
];

export default [
  { ignores: ['dist', 'coverage', 'node_modules'] },

  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: 'detect' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
      'import-x': importX,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      'react/prop-types': 'off',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'import-x/first': 'error',
      'import-x/newline-after-import': 'error',
      'import-x/no-duplicates': 'error',
      'import-x/no-restricted-paths': ['error', { zones: layerZones }],
    },
  },

  // Layer rules for alias imports.
  {
    files: ['src/shared/**/*.{js,jsx}'],
    rules: restrictImports(restrict.app, restrict.pages, restrict.features, restrict.services),
  },
  {
    files: ['src/services/**/*.{js,jsx}'],
    rules: restrictImports(restrict.app, restrict.pages, restrict.features),
  },
  {
    files: ['src/features/**/*.{js,jsx}'],
    rules: restrictImports(restrict.app, restrict.pages, restrict.featureInternals),
  },
  {
    files: ['src/pages/**/*.{js,jsx}'],
    rules: restrictImports(restrict.app, restrict.pages, restrict.featureInternals),
  },
  {
    files: ['src/app/**/*.{js,jsx}'],
    rules: restrictImports(restrict.featureInternals),
  },

  // Default exports only for React components and pages (.jsx). Slices, hooks,
  // utilities, constants and services (.js) use named exports.
  {
    files: ['src/**/*.js'],
    rules: { 'import-x/no-default-export': 'error' },
  },

  // Node-side config files.
  {
    files: ['*.config.js'],
    languageOptions: { globals: { ...globals.node } },
  },

  // Tests.
  {
    files: ['src/**/*.{test,spec}.{js,jsx}', 'src/test/**/*.js'],
    languageOptions: { globals: { ...globals.node, ...globals.vitest } },
  },

  prettier,
];
