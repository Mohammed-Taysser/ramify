# Frontend Development Context

## Purpose of This Context

This document captures the technical preferences, architectural patterns, and development standards for frontend development work. Use this to guide implementation decisions and maintain consistency.

## User Profile

**Role:** Full-stack developer with focus on modern React applications  
**Priorities:** Clean code, component reusability, type safety, user experience  
**Work Style:** Prefers reviewing plans before implementation, values simplicity over complexity

## Communication Style Rules

- Keep messages **extremely concise** - avoid redundancy
- Provide implementation plans for complex UI work and request approval
- Use brief confirmations like "LGTM" as approval signals
- Don't over-explain obvious changes
- Highlight design decisions and UX considerations
- Use selection comments to point out specific issues

## Technical Stack & Preferences

**Core Stack:**

- React with TypeScript
- Vite or Next.js for build tooling
- TailwindCSS or vanilla CSS (confirm preference)
- React Router for navigation
- Axios or Fetch for API calls

**Key Preferences:**

- Component-based architecture
- Type safety with TypeScript
- Responsive design from the start
- Accessible markup (semantic HTML, ARIA when needed)

## Design & Architecture Principles

### Component Architecture

- Small, focused components with single responsibility
- Separate container (logic) from presentational components
- Props interface clearly defined with TypeScript
- Default exports for pages, named exports for utilities

### State Management

- Local state for component-specific data
- Context API for shared app state
- Avoid prop drilling - use composition or context
- Keep state as close to usage as possible

### Styling Approach

- Consistent design system/tokens
- Mobile-first responsive design
- Reusable utility classes or styled components
- Avoid inline styles except for dynamic values

### API Integration

- Centralized API client/service layer
- Proper error handling and loading states
- Type-safe request/response with TypeScript
- Handle authentication tokens consistently

## Coding & Quality Standards

### Non-Negotiable Requirements

- TypeScript strict mode enabled
- No `any` types unless absolutely necessary
- Proper null/undefined handling
- Accessible UI components

### Code Organization

- Group imports: React, external libs, internal, types, styles
- Use meaningful component and variable names
- Keep components under 200-300 lines
- Extract complex logic into custom hooks

### File Structure

```text
src/
  components/     # Reusable UI components
  pages/         # Route components
  hooks/         # Custom React hooks
  services/      # API clients
  utils/         # Pure utility functions
  types/         # TypeScript type definitions
  context/       # React Context providers
```

## Common Pitfalls to Avoid

1. **Component Antipatterns**

   - Don't create god components with too many responsibilities
   - Don't use `useEffect` when not needed (respect React lifecycle)
   - Avoid unnecessary re-renders (use `memo`, `useMemo`, `useCallback` wisely)

2. **State Management**

   - Don't duplicate state - derive when possible
   - Don't store API responses directly without transformation
   - Avoid setState in loops

3. **TypeScript Issues**

   - Don't use `as any` to bypass type errors
   - Properly type component props, hooks, and API responses
   - Use discriminated unions for complex state

4. **Performance**
   - Don't fetch on every render
   - Lazy load routes and heavy components
   - Optimize images and assets

## Output Format Expectations

### Artifacts

- **task.md**: Granular checklist with `[ ]`, `[/]`, `[x]` notation
- **implementation_plan.md**: Clear sections with component structure, routing, state management
- **walkthrough.md**: Concise summary of UI implementation, components created, user flows

### Code Changes

- Show clear component interfaces
- Explain component composition decisions
- Document prop types and usage
- Include accessibility considerations

### Progress Updates

- Update task.md as components are built
- Mark items in-progress `[/]` before complete `[x]`
- Note visual/UX decisions made

## How the AI Should Handle Uncertainty

### When to Ask

- UI/UX design decisions without mockups
- State management architecture choices
- Routing structure for multi-page apps
- Third-party library selection

### When to Proceed

- Following established component patterns
- Making accessibility improvements
- Adding TypeScript types
- Refactoring for consistency

### Validation Approach

- Test components render without errors
- Verify responsive design at key breakpoints
- Check accessibility (keyboard nav, screen readers)
- Ensure TypeScript compilation succeeds
- Test user flows manually when needed
