# Design Refinements

## Todo

- [x] Add glow to progress ring when running
- [x] Improve time typography (weight, size balance)
- [x] Refine session counter with dot indicator
- [x] Polish button corners and shadows
- [x] Simplify status display
- [x] Test build

---

## Review

### Changes Made

**1. Timer Ring** (`TimerDisplay.tsx`)
- Added subtle glow backdrop when running (blur-xl, animate-pulse)
- Added drop-shadow filter on progress stroke when running
- Increased time font to 34px semibold with -0.03em tracking
- Status now shows "Ready" when idle, "Paused" when paused, nothing when running

**2. Session Counter** (`App.tsx`)
- Added blue dot indicator before count
- Shows "1 session" or "2 sessions" (pluralized)
- Cleaner settings icon (simpler gear path)

**3. Button Styling** (`App.css`)
- Deeper gradient (007ACC instead of 0080D6)
- Layered box-shadow with inset highlight
- Hover lifts button with translateY(-1px)
- Secondary buttons have subtle inset border
- Slightly larger padding (11px) and rounded corners (12px)

### Files Modified
- `src/components/TimerDisplay.tsx` - Glow effect, typography
- `src/App.tsx` - Session counter with dot
- `src/App.css` - Button polish

### Visual Improvements
- Running state now has ambient glow effect
- Buttons feel more tactile with layered shadows
- Cleaner status hierarchy (no redundant "Running" text)
- Session counter more scannable with dot indicator
