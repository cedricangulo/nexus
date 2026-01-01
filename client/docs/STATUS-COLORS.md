# Status Color System

Centralized status colors using Tailwind CSS custom properties and coss.ui semantic naming for consistent theming across the application.

## Color Variables

### Status Colors (Badge Semantic - coss.ui)

| Status         | CSS Variable | Light Mode                 | Dark Mode                  | Represents                 |
| -------------- | ------------ | -------------------------- | -------------------------- | -------------------------- |
| Completed/Done | `--success`  | `var(--color-emerald-100)` | `var(--color-emerald-950)` | Success, finished tasks    |
| In Progress    | `--info`     | `var(--color-blue-100)`    | `var(--color-blue-950)`    | Active work                |
| Review         | `--warning`  | `var(--color-amber-100)`   | `var(--color-amber-950)`   | Needs attention/inspection |
| Blocked        | `--error`    | `var(--color-red-100)`     | `var(--color-red-950)`     | Urgent problems            |
| Default        | `--info`     | `var(--color-blue-100)`    | `var(--color-blue-950)`    | Pending, not yet begun     |

**Foreground colors** are automatically paired:
- `--success-foreground`, `--info-foreground`, `--warning-foreground`, `--error-foreground`

### Phase Type Colors

| Phase Type | CSS Variable  | Light Mode                | Dark Mode                 | Represents             |
| ---------- | ------------- | ------------------------- | ------------------------- | ---------------------- |
| Waterfall  | `--waterfall` | `var(--color-cyan-100)`   | `var(--color-cyan-950)`   | Sequential methodology |
| Scrum      | `--scrum`     | `var(--color-indigo-100)` | `var(--color-indigo-950)` | Agile methodology      |
| Fall       | `--fall`      | `var(--color-orange-100)` | `var(--color-orange-950)` | Academic semester      |

**Foreground colors** are automatically paired:
- `--waterfall-foreground`, `--scrum-foreground`, `--fall-foreground`

## Usage

### Tailwind Classes

The CSS variables are exposed as Tailwind utility classes via the `@theme` directive:

```tsx
// Background colors with semantic naming
<div className="bg-success" />
<div className="bg-info" />
<div className="bg-warning" />
<div className="bg-error" />

// Text colors
<span className="text-success-foreground" />

// Border colors
<div className="border-info" />

// With opacity
<div className="bg-error/10" />
<div className="text-success/80" />

// Gradients
<div className="bg-linear-120 from-success to-success/80" />
```

### StatusBadge Component

The StatusBadge component automatically uses the centralized colors:

```tsx
import { StatusBadge } from "@/components/ui/status";

<StatusBadge status="IN_PROGRESS" />
<StatusBadge status="COMPLETED" />
<StatusBadge status="BLOCKED" />
```

### CategoryBar Component

CategoryBar supports semantic status color names:

```tsx
import { CategoryBar } from "@/components/ui/category-bar";

<CategoryBar
  colors={["success", "info", "warning", "info"]}
  values={[completed, inProgress, review, notStarted]}
/>
```

### Utility Functions

Status color utility functions return Tailwind classes:

```typescript
// client/lib/types/deliverables-utils.ts
getDeliverableAccentClass(status: DeliverableStatus): string

// client/components/shared/deliverables/summary-cards.tsx
getStatusColor(status: string): string

// client/components/team-lead/settings/activity-logs/client.tsx
getActionColor(action: string): string
```

## Deprecated Variables

The following CSS variables are deprecated and should no longer be used. They have been replaced with the new coss.ui semantic naming system:

| Deprecated Variable    | Replacement   | Notes                          |
| ---------------------- | ------------- | ------------------------------ |
| `--status-success`     | `--success`   | Use for completed/done states  |
| `--status-in-progress` | `--info`      | Use for active work            |
| `--status-warning`     | `--warning`   | Use for items needing review   |
| `--status-error`       | `--error`     | Use for blocked/urgent states  |
| `--status-info`        | `--info`      | Use for default/pending states |
| `--phase-waterfall`    | `--waterfall` | Use for waterfall methodology  |
| `--phase-scrum`        | `--scrum`     | Use for scrum methodology      |
| `--phase-fall`         | `--fall`      | Use for fall/academic semester |

**Migration Guide**: Replace all occurrences of deprecated variables with their replacements:
- `bg-status-success` → `bg-success`
- `bg-status-in-progress` → `bg-info`
- `bg-status-warning` → `bg-warning`
- `bg-status-error` → `bg-error`

The deprecated variables are kept in `globals.css` for backward compatibility but will be removed in a future version.

## Updated Components

### Core Components
- `components/ui/status.tsx` - StatusBadge and StatusIndicator
- `components/ui/category-bar.tsx` - Added status color variants

### Utility Functions
- `lib/types/deliverables-utils.ts` - getDeliverableAccentClass
- `components/shared/deliverables/summary-cards.tsx` - getStatusColor
- `components/team-lead/settings/activity-logs/client.tsx` - getActionColor

### Dashboard Components
- `components/team-lead/dashboard/phase-progress-cards.tsx`
- `components/team-lead/dashboard/sprint-health-card.tsx`
- `components/team-lead/dashboard/project-health-card.tsx`
- `components/team-lead/dashboard/pending-approvals-list.tsx`
- `components/team-lead/dashboard/blocked-items-list.tsx`
- `components/team-lead/dashboard/activity-logs.tsx`

### Meeting Analytics
- `components/shared/meetings/analytics/total-meetings-card.tsx`
- `components/shared/meetings/analytics/on-time-card.tsx`
- `components/shared/meetings/analytics/coverage-card.tsx`
- `components/shared/meetings/analytics/missing-meetings-card.tsx`

### Other Components
- `components/shared/pending-action-toast.tsx`

## Benefits

1. **Centralized Management**: Change colors in one place (`globals.css`)
2. **Dark Mode Support**: Automatic light/dark variants
3. **Type Safety**: Uses semantic naming (status-success vs bg-green-500)
4. **Consistency**: Same colors across all status representations
5. **Maintainability**: Easy to update color scheme
6. **Accessibility**: OKLCH color space for perceptual uniformity

## Color Rationale

- **Green/Emerald (Completed)**: Universal color for success and completion
- **Blue (In Progress)**: Calm, focused color representing active work
- **Purple (Review)**: Distinctive color for items needing inspection
- **Red/Orange (Blocked)**: Warning color for urgent attention
- **Slate/Gray (Todo/Not Started)**: Neutral color for inactive items
- **Amber (Waterfall/Pending)**: Moderate urgency, waiting state
- **Cyan (Scrum)**: Modern, agile methodology representation
- **Orange (Fall)**: Academic/seasonal representation

## Future Enhancements

Consider adding:
- Status transition colors (moving from one status to another)
- Custom color themes (e.g., high contrast, colorblind-friendly)
- Export color tokens for design tools
