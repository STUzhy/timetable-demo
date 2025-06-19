# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vue.js 3 course selection calendar system that allows students to select courses and view them in a weekly calendar layout with intelligent conflict detection and resolution.

## Development Commands

- `npm install` - Install dependencies
- `npm run dev` - Start development server on port 3000 (auto-opens browser)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Architecture

### Core Components

**App.vue** - Root component providing layout wrapper and gradient background

**WeeklyCalendar.vue** - Main calendar component containing all core logic:
- Left side: Weekly calendar grid (Monday-Sunday, 8:00-19:00)
- Right side: Course selection sidebar with sticky positioning
- Course conflict detection and resolution system

### Data Structure

Course objects follow this schema:
```javascript
{
  id: number,
  name: string,
  teacher: string,
  time: { day: number, start: number, end: number }, // day: 1-7, hours in 24h format
  room: string,
  selected: boolean,
  credits: number
}
```

### Key Features Implementation

**Conflict Detection**: `isTimeConflict()` function checks for overlapping time slots on the same day

**Course Selection States**:
- Selected: Blue highlight with "已选" badge
- Available: Green border with "可选" badge  
- Conflicted: Gray with "与XXX冲突" badge showing specific conflicting course

**Replacement Logic**: When clicking a conflicted course, shows confirmation dialog to replace the currently selected conflicting course

**Visual Overlapping**: Multiple courses in the same time slot are displayed with offset positioning and numbered badges (1/2, 2/2)

### Layout System

- Uses CSS Grid for calendar layout
- Right sidebar uses `position: sticky` to follow scroll
- Course blocks use absolute positioning for overlapping effects
- Responsive design with flexbox container

### Mock Data Design

Contains 13 courses with intentional conflicts:
- 5 conflict groups (2 courses each sharing same time slot)
- 3 non-conflicting courses
- Designed to demonstrate conflict detection and replacement workflows

### State Management

Uses Vue 3 Composition API with `ref()` for reactive state:
- `courses` - Main course data array
- `selectedCourses` - Computed property filtering selected courses
- Dialog state for course replacement confirmations

### Styling Approach

- Scoped CSS with utility classes
- Custom animations for dialog transitions
- Color-coded status system (blue/green/gray)
- CSS Grid for calendar structure, Flexbox for course list layout