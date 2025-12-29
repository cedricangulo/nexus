# Status Color System

Centralized status colors using Tailwind CSS custom properties for consistent theming across the application.

## Color Variables

### Status Colors

| Status           | CSS Variable           | Light Mode                | Dark Mode              | Represents                 |
| ---------------- | ---------------------- | ------------------------- | ---------------------- | -------------------------- |
| Completed/Done   | `--status-completed`   | `oklch(0.65 0.19 155)`    | `oklch(0.70 0.19 155)` | Success, finished tasks    |
| In Progress      | `--status-in-progress` | `oklch(0.55 0.19 250)`    | `oklch(0.60 0.19 250)` | Active work                |
| Review           | `--status-review`      | `oklch(78.976% 0.17 70)`  | `oklch(0.63 0.18 295)` | Needs attention/inspection |
| Blocked          | `--status-blocked`     | `oklch(58.019% 0.22 27)`  | `oklch(0.63 0.22 27)`  | Urgent problems            |
| Todo/Not Started | `--status-not-started` | `oklch(84.212% 0.00 271)` | `oklch(0.60 0.01 260)` | Pending, not yet begun     |

### Phase Type Colors

| Phase Type | CSS Variable        | Light Mode             | Dark Mode              | Represents             |
| ---------- | ------------------- | ---------------------- | ---------------------- | ---------------------- |
| Waterfall  | `--phase-waterfall` | `oklch(0.68 0.15 60)`  | `oklch(0.73 0.15 60)`  | Sequential methodology |
| Scrum      | `--phase-scrum`     | `oklch(0.58 0.15 200)` | `oklch(0.63 0.15 200)` | Agile methodology      |
| Fall       | `--phase-fall`      | `oklch(0.65 0.18 35)`  | `oklch(0.70 0.18 35)`  | Academic semester      |

## Usage

### Tailwind Classes

The CSS variables are exposed as Tailwind utility classes via the `@theme` directive:

```tsx
// Background colors
<div className="bg-status-completed" />
<div className="bg-status-in-progress" />
<div className="bg-status-review" />
<div className="bg-status-blocked" />

// Text colors
<span className="text-status-completed" />

// Border colors
<div className="border-status-in-progress" />

// With opacity
<div className="bg-status-blocked/10" />
<div className="text-status-completed/80" />

// Gradients
<div className="bg-linear-120 from-status-completed to-status-completed/80" />
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
  colors={["status-completed", "status-in-progress", "status-review", "status-not-started"]}
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
3. **Type Safety**: Uses semantic naming (status-completed vs bg-green-500)
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
