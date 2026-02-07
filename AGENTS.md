# AGENTS.md - Coding Guidelines for Agentic Agents

This document provides guidelines for AI agents working in this React Native Expo codebase.

## Global Skills Reference

This repository has access to global skills configured at `~/.config/opencode/skills/`:

- **react-native-skills** - React Native/Expo best practices (35+ rules)
- **react-best-practices** - General React optimization patterns

These skills cover: list performance, animations, navigation, state management, React Compiler compatibility, and UI patterns. Load them when working on React Native features.

## Project Overview

React Native Expo mobile app using TypeScript with file-based routing via expo-router, gluestack-ui for components, and NativeWind for styling.

## Build/Lint Commands

```bash
# Start development server
npm run start

# Run on specific platforms
npm run android
npm run ios
npm run web

# Linting (uses ESLint with expo-config)
npm run lint

# Reset project (moves app/ to app-example/)
npm run reset-project
```

**Note:** This project does not have tests configured. If adding tests, use Jest with React Native Testing Library.

## Code Style Guidelines

### TypeScript Configuration
- Strict mode enabled (`tsconfig.json`)
- Path alias: `@/*` maps to project root
- Include: `**/*.ts`, `**/*.tsx`, `.expo/types/**/*.ts`, `expo-env.d.ts`

### Import Conventions

**Order:**
1. React and React Native imports
2. Third-party library imports (expo, react-navigation, etc.)
3. Internal imports using `@/` alias
4. Relative imports (avoid when possible)

**Example:**
```typescript
import { StyleSheet, Text, type TextProps } from 'react-native';
import { Image } from 'expo-image';
import { Stack } from 'expo-router';

import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedView } from '@/components/themed-view';
```

### Formatting
- VS Code settings organize imports and sort members on save
- No semicolon enforcement (follow existing patterns)
- 2-space indentation
- Single quotes for strings

### Naming Conventions

**Files:**
- Components: `kebab-case.tsx` (e.g., `themed-text.tsx`, `parallax-scroll-view.tsx`)
- Hooks: `use-kebab-case.ts` (e.g., `use-color-scheme.ts`, `use-theme-color.ts`)
- Constants: `kebab-case.ts` (e.g., `theme.ts`)
- Utilities: `kebab-case.ts`

**Exports:**
- Components: PascalCase function names (e.g., `ThemedText`, `HelloWave`)
- Hooks: camelCase with `use` prefix (e.g., `useThemeColor`, `useColorScheme`)
- Types: PascalCase with `Props` suffix for component props (e.g., `ThemedTextProps`)
- Constants: PascalCase for object exports (e.g., `Colors`, `Fonts`)

**UI Components:**
- Use gluestack-ui components from `@/components/ui/*` (Box, Button, Text, etc.)
- Style with NativeWind utility classes (e.g., `className="flex-1 bg-primary-500"`)
- Prefer composition over custom styled components

### Platform-Specific Code
- Use `.ios.tsx`, `.android.tsx`, `.web.ts` extensions for platform variants
- Use `Platform.select()` for inline platform logic

### Theming
- Always use `useThemeColor()` hook for colors
- Support `lightColor` and `darkColor` props for customization
- Access colors via `@/constants/theme` Colors object

### Error Handling
- Use TypeScript strict mode for compile-time safety
- Prefer early returns over nested conditionals
- Handle null/undefined with optional chaining (`?.`) and nullish coalescing (`??`)

### Expo Router Conventions
- Routes in `app/` directory
- Layout files: `_layout.tsx`
- Group routes with parentheses: `(tabs)/`
- Dynamic routes with brackets: `[id].tsx`
- Modals and special screens configured in root `_layout.tsx`

### Git
- Do not commit: `node_modules/`, `.expo/`, `dist/`, `web-build/`, `.env*.local`, `ios/`, `android/`
- Follow existing commit patterns if any

### Key Dependencies
- expo-router: File-based routing
- @gluestack-ui/core: UI component library with NativeWind styling
- nativewind: Tailwind CSS for React Native
- expo-image: Image component
- react-native-reanimated: Animations
- react-native-gesture-handler: Gestures
- @expo/vector-icons: Icon library
- firebase: Authentication

### Directory Structure
```
app/            # Routes and layouts
components/     # Reusable components
  ui/           # gluestack-ui primitives
contexts/       # React contexts (AuthProvider)
lib/            # External service configs (firebase)
hooks/          # Custom hooks
constants/      # Constants and theme
assets/         # Static assets
scripts/        # Build scripts
```
