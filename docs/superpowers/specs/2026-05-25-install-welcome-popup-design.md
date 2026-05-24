# Install Welcome Popup — Design Spec

**Date:** 2026-05-25
**Status:** Approved
**Branch:** `ai-test/install-popup`

---

## Problem

The `/install` page drops users directly into a dense configuration form with no orientation. A brief welcome moment helps set context before they start filling in database credentials and admin passwords.

## Goal

Show a modal welcome popup once per browser session when the user opens `/install`. The popup dismisses with a close button and must not interfere with the installation form beneath it.

## Out of Scope

- Server-side rendering of the popup (no Razor partial, no model changes)
- Persistent dismissal across sessions (localStorage)
- Any changes to the installation form or its logic

---

## Implementation: Option A — Extend existing files only

All changes are confined to three files that already exist:

| File | Change |
|------|--------|
| `src/Modules/Grand.Module.Installer/Views/Install/Index.cshtml` | Add popup + overlay HTML before `</body>` |
| `src/Web/Grand.Web/wwwroot/assets/install/style.css` | Append overlay, popup, and animation CSS |
| `src/Web/Grand.Web/wwwroot/assets/install/install.js` | Append session check, show, and dismiss logic |

---

## HTML Structure

Appended inside `<body>`, after all existing content and before `</body>`:

```html
<div id="install-overlay" class="install-overlay">
  <div id="install-popup" class="install-popup">
    <p class="install-popup__text">Welcome to GrandNode2 Installation!</p>
    <button id="install-popup-close" class="install-popup__close">Close</button>
  </div>
</div>
```

- `#install-overlay` — full-screen fixed backdrop; blocks all pointer events on the form beneath it
- `#install-popup` — the card; centered inside the overlay via flexbox
- `.install-popup__text` — the welcome message
- `#install-popup-close` — the dismiss button

---

## CSS Specification

Appended to the end of `style.css`. All class names are prefixed with `install-` to match the existing scoping convention in that file.

### Overlay
- `position: fixed`, `inset: 0`, `z-index: 9999`
- Background: `rgba(0, 0, 0, 0.5)` (50% black)
- `backdrop-filter: blur(5px)` — blurs the installation form behind the overlay
- Display: `flex`, `align-items: center`, `justify-content: center` — centers the popup
- Hidden by default: `display: none`

### Popup card
- `background: #f0f0f0` (light grey)
- `border-radius: 12px`
- `min-width: 360px`
- `padding: 2rem`
- `text-align: center`
- `display: flex`, `flex-direction: column`, `align-items: center`, `gap: 1.5rem`

### Close button
- `background: #cccccc`
- `color: #000000`
- `border: none`
- `border-radius: 6px`
- `padding: 0.5rem 1.5rem`
- `cursor: pointer`
- Hover: `background: #bbbbbb`

### Animations

```css
@keyframes install-slide-up {
  from { transform: translateY(80px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

@keyframes install-slide-down {
  from { transform: translateY(0);    opacity: 1; }
  to   { transform: translateY(80px); opacity: 0; }
}
```

- `.install-popup--entering` — applies `install-slide-up`, duration `0.35s ease-out`
- `.install-popup--leaving` — applies `install-slide-down`, duration `0.3s ease-in`

---

## JavaScript Behaviour

Appended to the end of `install.js`. No changes to existing functions.

### Session key
```
installPopupDismissed
```

### On `DOMContentLoaded`
1. Check `sessionStorage.getItem('installPopupDismissed')`
2. If not set: set `#install-overlay` to `display: flex`, add `.install-popup--entering` to `#install-popup`
3. Remove `.install-popup--entering` on `animationend` (keeps element in final position)

### On close button click
1. Remove `.install-popup--entering` (if still present), add `.install-popup--leaving` to `#install-popup`
2. On `animationend`: set `#install-overlay` to `display: none`, set `sessionStorage.installPopupDismissed = '1'`

### Edge case
- If `sessionStorage` is unavailable (private browsing restrictions in some browsers): catch the exception, show the popup anyway (fail open rather than crash)

---

## Success Criteria

- Opening `/install` in a fresh tab → popup appears with slide-up animation
- Clicking Close → popup slides down and disappears; form is fully interactive
- Refreshing the page in the same tab → popup does not appear
- Opening `/install` in a new tab → popup appears again
- The installation form beneath the overlay is not clickable while the popup is visible
- No changes to installation form behaviour, validation, or submission
