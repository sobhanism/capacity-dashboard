# Capacity Management Dashboard

A Nuxt 3 + Vue 3 + TypeScript dashboard that turns centre, classroom, and
enrolment data into clear capacity information for operations planning.

It helps an operations user understand, at a glance, which centres and
classrooms are healthy, which are over-capacity, where there are incompatible
age-group assignments, and which children are not yet assigned.

## Features

- Centre and classroom capacity overview (capacity / used / available / utilization).
- Visual signals (not errors) for:
  - **Over-capacity classrooms**
  - **Incompatible age-group assignments**
- Unassigned children listed separately (not counted against capacity).
- Month selector driven by the API's `available_months`.
- Complete interface states: loading, empty, and error (with retry).
- Responsive layout for desktop and mobile.

## Setup

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open http://localhost:3000.

## Scripts

```bash
npm run dev         # Start the development server
npm run build       # Build the application for production
npm run preview     # Locally preview the production build
npm test            # Run automated tests (vitest)
npm run typecheck   # TypeScript checking
npm run lint        # Run ESLint
npm run format      # Format code with Prettier
```

## Architecture

```
types/capacity.ts                API response types (CapacityOverview, Classroom, Enrolment, ...)
composables/useCapacity.ts       Fetches the capacity-overview endpoint; supports a month param
utils/capacityCalculator.ts      Pure functions implementing the capacity rules
pages/index.vue                  Single-page dashboard
utils/__tests__/                 Unit tests for the capacity rules
```

## Capacity rules implemented

- Each full-time enrolment consumes one physical place.
- One three-day and one two-day enrolment may share one place (pairs).
- An unpaired part-time enrolment still consumes one place.
- Unassigned children are shown but never counted against a classroom.
- Over-capacity rooms and incompatible age-group assignments are shown as
  visual signals, not API errors.

The rules live in `calculateUsedPlaces` and are covered by unit tests
(`utils/__tests__/capacityCalculator.test.ts`).

## Assumptions & trade-offs

- Assignments are not filtered by their effective dates (`starts_on` /
  `ends_on`) within the reporting month. Every enrolment currently assigned to
  a classroom is counted. Filtering by effective dates is a planned next step.
- Some reported months (e.g. `2026-01`) return a `500` from the upstream API
  instead of the documented `422`; these are surfaced as an error state.
- The data is fetched client-side (`server: false`) so the dashboard works as a
  static deployment without SSR networking issues.

## What I would improve next

- Filter enrolments by the class assignment effective dates per month.
- Break the page into reusable components (`ClassroomCard`, `CentreSection`).
- Add a small chart of utilization trends across months.
- Handle invalid months more gracefully (keep previous data and show a notice
  instead of a full error screen).