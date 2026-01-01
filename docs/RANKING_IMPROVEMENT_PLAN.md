# Ranking Page Improvement Plan

## Goal

Update the **Total Donation Ranking** page to align with the "Modern Luxury & Minimal" aesthetic, specifically replacing hardcoded colors with the new **Deep Pink (#C41E7F)** and **Metallic Gold** variables, and ensuring the "Gauge Bar" visualization is consistent.

## Proposed Changes

### 1. Refactor `GaugeBar.tsx` & `GaugeBar.module.css`

- **Remove Hardcoded Hex**: Replace `#ffd700` etc., with `var(--metallic-gold)`, `var(--metallic-silver)`, `var(--metallic-bronze)`.
- **Update Default Color**: Use `var(--color-pink)` instead of the previous primary.
- **Glow Effect**: Ensure the glow matches the new variables.

### 2. Refine `RankingCard.module.css`

- **Card Background**: Ensure it uses `var(--surface)` or `var(--card-bg)` with correct border colors.
- **Rank Badges**: Update styles to use `var(--metallic-*)` variables.
- **Particles/Effects**: Tweak to be subtle (Matte Luxury) rather than generic neon.

### 3. Verify `RankingList`

- **List Item Style**: Ensure status/rank colors match the top 3 style but in a list format.

## Verification Plan

1.  **CSS Variable Check**: Inspect elements in DevTools to ensure no hardcoded `#ffd700` remains.
2.  **Visual Check**:
    - Rank 1: Gold Gradient + Deep Pink Accents.
    - Rank 2: Silver/Platinum Gradient.
    - Rank 3: Bronze/Copper Gradient.
    - Rank 4+: Clean Dark Grey with Deep Pink progress bars.
