# AGENTS.md - Coding Guidelines for Agentic Agents

This document provides guidelines for AI agents working in this React Native Expo codebase.

## Project Overview

React Native Expo mobile app using TypeScript with file-based routing via expo-router.

## Global Skills Reference

This repository has access to global skills configured at `~/.config/opencode/skills/`:

- **react-native-skills** - React Native/Expo best practices (35+ rules)
- **react-best-practices** - General React optimization patterns

These skills cover: list performance, animations, navigation, state management, React Compiler compatibility, and UI patterns. Load them when working on React Native features.

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

**Note:** This project does not currently have tests configured. If adding tests, follow Jest patterns common in React Native projects.

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

### Component Patterns

**Functional Components:**
```typescript
export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  // Implementation
}
```

**Styles:**
- Use `StyleSheet.create()` for all styles
- Define styles at bottom of file
- Use theme-aware colors via `useThemeColor` hook

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
- expo-image: Image component
- react-native-reanimated: Animations
- react-native-gesture-handler: Gestures
- @expo/vector-icons: Icon library

### Directory Structure
```
app/            # Routes and layouts
components/     # Reusable components
  ui/           # UI primitives
hooks/          # Custom hooks
constants/      # Constants and theme
assets/         # Static assets
scripts/        # Build scripts
```
