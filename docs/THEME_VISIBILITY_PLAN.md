# Theme Visibility Repair Plan

## Goal

Fix the contrast and visibility issues in both Light and Dark modes by properly defining the missing `var(--metallic-*)` and `var(--progress-*)` CSS variables in `globals.css`.

## Proposed Changes

### 1. Update `src/app/globals.css`

#### **Base Definitions (`:root`)**

- Define the **Dark Mode** versions of metallic variables as the default (since the site is "Dark Mode First" aesthetics).
- Variables to add:
  - `--metallic-gold-bg`, `--metallic-gold-border`, `--metallic-gold`, `--metallic-gold-glow`, `--metallic-gold-gradient`
  - (Same for Silver and Bronze)
  - `--progress-gradient`, `--progress-glow`

#### **Light Theme Overrides (`[data-theme="light"]`)**

- Override the metallic variables to offer better contrast against white backgrounds.
- **Strategy**: Use darker, richer metallic tones (e.g., Bronze becomes a deep copper, Silver becomes a cool slate grey) instead of the pale "glowing" versions used in Dark Mode.

## Verification Plan

1.  **Code Check**: Ensure all new variables are present in `globals.css`.
2.  **Browser Check**:
    - **Dark Mode**: Confirm Ranking Cards look like the "Premium Dark" design (Glowing Gold).
    - **Light Mode**: Toggle theme and confirm Ranking Cards remain visible and look "Premium Light" (Darker/Matte Gold text on White card).
