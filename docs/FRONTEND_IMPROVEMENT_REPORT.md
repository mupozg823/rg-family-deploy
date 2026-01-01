# RG Family Frontend Improvement Report

**Date:** 2026-01-01
**Based on:** 12/26 Meeting Minutes & Codebase Analysis

## 0. Executive Summary

This report analyzes the discrepancy between the current frontend implementation and the confirmed direction from the 12/26 meeting. It outlines a systematic plan to resolve layout inconsistencies, fix mobile ratio issues, and strictly enforce the "Modern Luxury & Minimal" aesthetic with the "Deep Pink" identity.

---

## 1. Diagnosis: Current Issues vs. Requirements

### 1-1. Design Consistency (Mood & Tone)

- **Requirement**: "Modern Luxury & Minimal". Hip Logo, but clean/official UI.
  - **Color**: Black Base + **Deep Pink (#C41E7F)** Points. No Neon.
  - **Vibe**: Not "Playful", Not "Antique Gold". Focused on "Organization" feel.
- **Current State**:
  - `globals.css` defines a hybrid "Premium Dark" theme but still contains legacy generic colors (`--red`, `--blue`).
  - Some components likely retain "Neon" or "Glassmorphism" effects that conflict with the "Matte/Minimal" direction.
  - "Deep Pink" is defined but might not be universally applied as the _only_ point color.

### 1-2. Layout & Feature Gaps

| Feature          | Meeting Requirement                             | Current Implementation         | Gap / Action                                                                        |
| :--------------- | :---------------------------------------------- | :----------------------------- | :---------------------------------------------------------------------------------- |
| **Hero**         | **Looping Banner**, Lineup/Season focus.        | Standard Carousel.             | **Fix**: Optimize for "Banner" feel, ensure infinite loop, fix mobile aspect ratio. |
| **Live**         | **Low Priority**. Badge only. Reliable UX.      | Complex fetching logic.        | **Fix**: Simplify to "Active Members" list. Remove dependency on unreliable APIs.   |
| **Notice**       | **Banner/Card Style**. Distinct from Community. | List Style.                    | **Fix**: Redesign as high-visibility Cards/Banners (Thumbnail Left).                |
| **Mobile**       | **Mobile First**. Critical.                     | Ratio/Spacing issues reported. | **Fix**: Audit all paddings/font-sizes for mobile. Fix Hero height on mobile.       |
| **Organization** | **Pyramid Hierarchy** (Queen/Princess).         | Standard Grid/List.            | **Fix**: Implement specific "Hierarchy Layout" (Pyramid).                           |

---

## 2. Action Plan: Systematic Improvement

### Phase 1: Foundation & Standardization (Immediate)

**Goal**: Eliminate "Mixed" styles and enforce the Branding.

1.  **CSS Cleanup**:
    - Purge unused "Neon" and "Generic Red/Blue" variables from `globals.css`.
    - Enforce `var(--color-pink)` (#C41E7F) as the **Sole Primary Accent**.
    - Set Background to Matte Black (`#0F1115`) globally.
2.  **Typography & Spacing Check**:
    - Ensure `Inter` (Headers) and `Noto Sans KR` (Body) are applied consistently.
    - Standardize `border-radius` (Card roundedness) to be consistent (e.g., `12px` or `16px`).

### Phase 2: Core Component Refactoring

**Goal**: Align layouts with reference sites (K-Group, C9) and fix Ratios.

#### A. Main Hero (Mobile Ratio Fix)

- **Issue**: Often too tall on mobile, pushing content down.
- **Fix**:
  - **Desktop**: 21:9 or 16:6 Wide Banner.
  - **Mobile**: **16:9** or **1:1** (Square) optimized specific banner.
  - **Loop**: Ensure "Infinte Loop" animation for Lineups.

#### B. Live & Notice Split

- **Issue**: "Intuitive Top Structure" needed.
- **Fix**:
  - **Desktop**: 50:50 Grid. Left: "On Air/Active" (Circular Avatars). Right: "Official Notice" (2 Banner Cards).
  - **Mobile**: Stack vertically. "Current Live" horizontal scroll → "Notice" vertical stack.

#### C. Navigation

- **Fix**: Ensure "Hamburger Menu" on mobile is intuitive and matches the "Black/Pink" theme (no default white bars).

### Phase 3: Feature Implementation (Page by Page)

1.  **Organization Page (`/members`)**:
    - Implement **Tab System** (Excel / Crew).
    - Implement **Pyramid Layout** (Head -> Top -> Members).
2.  **Signature Gallery (`/signature`)**:
    - Grid of Cards. Video Modal.
3.  **Schedule (`/schedule`)**:
    - Monthly Calendar View (Manual Input Support).
4.  **VIP Zone (`/vip`)**:
    - **Top 3 Only**. Premium Gold/Black styling. Exclusive archiving.

---

## 3. Detailed Component Specs (For Development)

### 🎨 Color Palette (Strict Enforcement)

- **Background**: `#0F1115` (Matte Black)
- **Surface**: `#1A1A1E` (Dark Grey)
- **Primary Point**: `#C41E7F` (Deep Pink) - Buttons, Active States, Badges.
- **Secondary Point**: `#333333` (Dark Metal) - Borders, Inactive elements.
- **Text**: `#FFFFFF` (Headings), `#E5E5E5` (Body).

### 📱 Mobile Breakpoints

- **Mobile (< 768px)**:
  - Container Padding: `16px`.
  - Hero Height: `aspect-ratio: 1/1` or `4/3`.
  - Font Size: Body `14px`, H1 `24px`.
- **Desktop (> 1024px)**:
  - Container Max-width: `1280px`.
  - Hero Height: `600px` max.

---

## 4. Next Steps & Approval

1.  **Confirm this Action Plan**: Do you agree with the "Deep Pink + Matte Black" strict enforcement?
2.  **Prioritize**: Shall we start with **"Main Page Ratio & Hero Fix"** immediately?
