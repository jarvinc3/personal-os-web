# Floating Bottom Sheet

## Goal

Allow `BottomSheet` to present short informational, notification, and success
content as a floating card instead of a full-width or side-mounted sheet.

## Design

`BottomSheet` keeps its existing `variant` API:

- `default` preserves the current responsive behavior: bottom on mobile and
  right-aligned on larger screens.
- `floating` always opens from the bottom, on every viewport size.

The floating content is centered horizontally, inset from the left, right, and
bottom viewport edges, constrained to a compact maximum width, and uses rounded
corners on every side. Its maximum height remains bounded so overflowing
content continues to scroll inside the existing content region.

The existing header and footer structure, including their separators, remains
unchanged. Pending state, actions, descriptions, drag behavior, overlay,
animations, and close behavior also remain unchanged.

The floating styles belong to `BottomSheet`, not the generic `DrawerContent`,
because this is a semantic variant of the layout component and must not alter
other drawer consumers.

## Verification

Add a focused source-level specification covering the floating direction and
layout classes, then run that specification, TypeScript checking, and ESLint
for the changed files. Verify visually that the floating variant remains inset
and centered on both mobile and desktop while the default variant is unchanged.
