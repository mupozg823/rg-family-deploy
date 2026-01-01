# Elite Ranking Podium Improvement Plan

## Goal

Transform the current "Gradient Card" styling for the Top 3 rankings into a **"3D Glass Cube Podium"** design, matching the reference image provided by the user.

## Design Analysis (Reference Image)

1.  **Top 3 Layout**:
    - **Structure**: 3D Glass Cubes (Podiums) of varying heights.
    - **1st Place**: Tallest center cube (Gold).
    - **2nd Place**: Medium left cube (Silver).
    - **3rd Place**: Shortest right cube (Bronze).
    - **Content**: Avatar floats _inside_ or _above_ the cube. Name and Badge are displayed on the front/top.
2.  **List Layout**:
    - **Style**: Dark, sleek horizontal bars with gold borders.
    - **Columns**: Rank | User (Avatar + Name) | Score | Badge.

## Proposed Changes

### 1. New Component: `RankingPodium`

- Create `src/components/ranking/RankingPodium.tsx`.
- **Logic**:
  - Takes the top 3 items as props.
  - Renders a flex/grid container with the 3 items in order: 2nd, 1st, 3rd.
- **Styling (`RankingPodium.module.css`)**:
  - Implement "Glass Cube" using CSS transforms/borders (or a flat glass illusion).
  - **Key Concept**: A translucent box (`backdrop-filter`) with a "light beam" effect at the top.

### 2. Refactor `RankingList`

- **Header**: Add a visible table header (RANK, USER, SCORE, BADGE) as shown in the image.
- **Row Style**: Match the sleek, dark, gold-bordered strip style.
- **Badge Column**: Add a dedicated column for the Rank Badge (Medal/Icon).

### 3. Integrated Page Update (`total/page.tsx`)

- Replace the current `top3.map(...)` loop with the new `<RankingPodium items={top3} />`.
- Ensure the `RankingList` follows immediately below.

## Verification Plan

1.  **Visual Match**:
    - Compare the rendered output with the `uploaded_image`.
    - Key check: Does it look like a 3D stage? Are the cubes glass-like?
2.  **Responsiveness**:
    - Desktop: Podium Layout.
    - Mobile: Fallback to a vertical stack (or a simplified carousel) as 3D cubes don't work well on small screens.
