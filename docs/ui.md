# UI Coding Standards

This document outlines the coding standards and conventions for all UI components and styling in this project.

## Component Library

### shadcn/ui Components

**MANDATORY**: All UI components in this project MUST use [shadcn/ui](https://ui.shadcn.com/) components.

- **No custom components**: Do not create custom UI components from scratch
- **Use shadcn exclusively**: All buttons, inputs, cards, dialogs, and other UI elements must come from shadcn/ui
- **Component installation**: Install components as needed using `npx shadcn@latest add [component-name]`
- **Customization**: If customization is needed, modify the shadcn component files in `src/components/ui/` rather than creating new components

### Available shadcn Components

Before building any UI, check the [shadcn/ui components](https://ui.shadcn.com/docs/components) directory for available components including:

- Buttons
- Forms (Input, Textarea, Select, Checkbox, Radio, etc.)
- Layout (Card, Separator, Tabs, etc.)
- Overlays (Dialog, Sheet, Popover, Dropdown Menu, etc.)
- Data Display (Table, Badge, Avatar, etc.)
- Feedback (Toast, Alert, Progress, etc.)
- Navigation (Navigation Menu, Breadcrumb, Pagination, etc.)

### Component Usage Example

```typescript
// ✅ CORRECT - Using shadcn components
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function Page() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Enter text" />
        <Button>Submit</Button>
      </CardContent>
    </Card>
  );
}

// ❌ INCORRECT - Creating custom components
export default function Page() {
  return (
    <div className="custom-card">
      <div className="custom-header">Title</div>
      <input className="custom-input" />
      <button className="custom-button">Submit</button>
    </div>
  );
}
```

## Date Formatting

### date-fns Library

**MANDATORY**: All date formatting must use the [date-fns](https://date-fns.org/) library.

### Required Date Format

Dates must be formatted using the following standard:

- **Format**: `do MMM yyyy`
- **Examples**:
  - `1st Sep 2025`
  - `2nd Aug 2025`
  - `3rd Jan 2025`
  - `21st Dec 2024`

### Date Formatting Implementation

```typescript
import { format } from "date-fns";

// ✅ CORRECT - Using date-fns with standard format
const formattedDate = format(new Date(), "do MMM yyyy");
// Output: "1st Jan 2025"

const workoutDate = format(workout.createdAt, "do MMM yyyy");
// Output: "15th Mar 2025"

// ❌ INCORRECT - Using native JS date methods
const date = new Date().toLocaleDateString();

// ❌ INCORRECT - Using wrong format
const date = format(new Date(), "MM/DD/YYYY");
```

### Common Date Operations

```typescript
import { format, parseISO, addDays, subDays, isAfter, isBefore } from "date-fns";

// Format a date string from database
const displayDate = format(parseISO(dateString), "do MMM yyyy");

// Add/subtract days
const tomorrow = format(addDays(new Date(), 1), "do MMM yyyy");
const yesterday = format(subDays(new Date(), 1), "do MMM yyyy");

// Compare dates
const isNewWorkout = isAfter(workout.createdAt, lastWeek);
```

## Styling Guidelines

### Tailwind CSS

- Use Tailwind CSS v4 utility classes for all styling
- Follow the Tailwind conventions for responsive design (`sm:`, `md:`, `lg:`, etc.)
- Use Tailwind's built-in color palette and spacing scale

### shadcn Theming

- shadcn components use CSS variables for theming defined in `src/app/globals.css`
- Modify theme variables in `globals.css` rather than overriding component styles
- Use the `cn()` utility from `@/lib/utils` for conditional classes

```typescript
import { cn } from "@/lib/utils";

// ✅ CORRECT - Using cn() for conditional classes
<Button className={cn("w-full", isLoading && "opacity-50")} />

// ❌ INCORRECT - String concatenation
<Button className={`w-full ${isLoading ? "opacity-50" : ""}`} />
```

## Form Handling

### React Hook Form with shadcn

For forms, use React Hook Form with shadcn Form components:

```typescript
"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function MyForm() {
  const form = useForm();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

## Typography

### Using Geist Fonts

The project uses Geist Sans and Geist Mono fonts, configured in the root layout:

- Default text: Geist Sans (`font-sans`)
- Monospace/code: Geist Mono (`font-mono`)

```typescript
// ✅ CORRECT - Using font classes
<div className="font-sans">Regular text</div>
<code className="font-mono">Code snippet</code>
```

## Accessibility

### shadcn Accessibility Features

- shadcn components come with built-in accessibility features
- Always provide proper labels for form inputs
- Use semantic HTML through shadcn components
- Maintain keyboard navigation support

```typescript
// ✅ CORRECT - Accessible form input
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input type="email" placeholder="Enter your email" {...field} />
      </FormControl>
    </FormItem>
  )}
/>
```

## Icons

### Lucide React Icons

shadcn/ui uses [Lucide React](https://lucide.dev/) for icons. Use these icons consistently throughout the project:

```typescript
import { Calendar, User, Settings } from "lucide-react";

// ✅ CORRECT - Using Lucide icons
<Button>
  <Calendar className="mr-2 h-4 w-4" />
  Schedule
</Button>
```

## Loading States

### Using shadcn Skeleton

For loading states, use the shadcn Skeleton component:

```typescript
import { Skeleton } from "@/components/ui/skeleton";

// ✅ CORRECT - Using Skeleton for loading
{isLoading ? (
  <Skeleton className="h-12 w-full" />
) : (
  <Card>{content}</Card>
)}
```

## Summary

### Key Rules

1. **ONLY use shadcn/ui components** - No custom UI components
2. **Date formatting with date-fns** - Format: `do MMM yyyy`
3. **Tailwind CSS for styling** - Use utility classes
4. **Lucide React for icons** - Consistent icon library
5. **Accessibility first** - Leverage shadcn's built-in features

### Before Building UI

1. Check [shadcn/ui components](https://ui.shadcn.com/docs/components) for available components
2. Install needed components: `npx shadcn@latest add [component-name]`
3. Use date-fns for any date formatting
4. Apply Tailwind utilities for custom spacing/layout
5. Test keyboard navigation and screen reader support

---

**Last Updated**: January 2025
**Maintained By**: Development Team
