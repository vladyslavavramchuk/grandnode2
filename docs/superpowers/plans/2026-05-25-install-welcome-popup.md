# Install Welcome Popup — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a session-once welcome popup to `/install` that slides up on first visit, blurs the background, and slides away when the user clicks Close.

**Architecture:** Pure client-side — HTML in `Index.cshtml`, CSS in `style.css`, JS in `install.js`. No server-side changes. The overlay is hidden by default via CSS; JS reads `sessionStorage` on `DOMContentLoaded` and shows the popup if the session flag is absent. All class names are prefixed `install-` to match the existing scoping convention in `style.css`.

**Tech Stack:** Vanilla JS (ES5-compatible), CSS3 animations (`@keyframes`), `sessionStorage`, ASP.NET Core Razor (cshtml)

**Spec:** `docs/superpowers/specs/2026-05-25-install-welcome-popup-design.md`

---

### Task 1: Add popup CSS to `style.css`

**Files:**
- Modify: `src/Web/Grand.Web/wwwroot/assets/install/style.css` (append after line 3018)

- [ ] **Step 1: Verify current end of file**

Read the last 5 lines to confirm there's no existing popup CSS:

```bash
tail -5 src/Web/Grand.Web/wwwroot/assets/install/style.css
```
Expected: ends with `}` after a media query block. No `install-overlay` or `install-popup` classes.

- [ ] **Step 2: Append popup CSS**

Append the following block to the **end** of `src/Web/Grand.Web/wwwroot/assets/install/style.css`:

```css

/* ========================================
   Install Welcome Popup
   ======================================== */

.install-overlay {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    align-items: center;
    justify-content: center;
}

.install-popup {
    background: #f0f0f0;
    border-radius: 12px;
    min-width: 360px;
    padding: 2rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
}

.install-popup__text {
    margin: 0;
    font-size: 1.1rem;
    color: #333333;
}

.install-popup__close {
    background: #cccccc;
    color: #000000;
    border: none;
    border-radius: 6px;
    padding: 0.5rem 1.5rem;
    cursor: pointer;
    font-size: 1rem;
}

.install-popup__close:hover {
    background: #bbbbbb;
}

@keyframes install-slide-up {
    from { transform: translateY(80px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
}

@keyframes install-slide-down {
    from { transform: translateY(0);    opacity: 1; }
    to   { transform: translateY(80px); opacity: 0; }
}

.install-popup--entering {
    animation: install-slide-up 0.35s ease-out forwards;
}

.install-popup--leaving {
    animation: install-slide-down 0.3s ease-in forwards;
}
```

- [ ] **Step 3: Verify CSS was appended correctly**

```bash
grep -n "install-overlay\|install-popup\|install-slide" src/Web/Grand.Web/wwwroot/assets/install/style.css
```
Expected: multiple matches — `.install-overlay`, `.install-popup`, `.install-popup__text`, `.install-popup__close`, `.install-popup--entering`, `.install-popup--leaving`, `install-slide-up`, `install-slide-down`.

- [ ] **Step 4: Commit**

```bash
git add src/Web/Grand.Web/wwwroot/assets/install/style.css
git commit -m "Add install welcome popup CSS"
```

---

### Task 2: Add popup HTML to `Index.cshtml`

**Files:**
- Modify: `src/Modules/Grand.Module.Installer/Views/Install/Index.cshtml` (insert before line 255 `</body>`)

The popup HTML must be inside `<body>` but outside the form. It goes immediately before the closing `</body>` tag (currently line 255).

- [ ] **Step 1: Verify line 253–256 of Index.cshtml**

```bash
sed -n '252,256p' src/Modules/Grand.Module.Installer/Views/Install/Index.cshtml
```
Expected output:
```
}
</div>
</body>
</html>
```

- [ ] **Step 2: Insert popup HTML before `</body>`**

Insert the following block at line 254 (immediately before `</body>`). The file currently has `</body>` at line 255 — inserting here pushes it to line 259.

In `src/Modules/Grand.Module.Installer/Views/Install/Index.cshtml`, replace:
```html
</div>
</body>
</html>
```
with:
```html
</div>

<!-- Welcome popup -->
<div id="install-overlay" class="install-overlay">
    <div id="install-popup" class="install-popup">
        <p class="install-popup__text">Welcome to GrandNode2 Installation!</p>
        <button id="install-popup-close" class="install-popup__close">Close</button>
    </div>
</div>
</body>
</html>
```

- [ ] **Step 3: Verify the HTML was inserted**

```bash
grep -n "install-overlay\|install-popup\|install-popup-close" src/Modules/Grand.Module.Installer/Views/Install/Index.cshtml
```
Expected: 3 matches — `install-overlay` div, `install-popup` div, `install-popup-close` button — all near the end of the file.

- [ ] **Step 4: Commit**

```bash
git add src/Modules/Grand.Module.Installer/Views/Install/Index.cshtml
git commit -m "Add install welcome popup HTML"
```

---

### Task 3: Add popup JS to `install.js`

**Files:**
- Modify: `src/Web/Grand.Web/wwwroot/assets/install/install.js` (append after line 57)

The new code uses an IIFE to avoid polluting the global scope. It appends to the existing `DOMContentLoaded` pattern already in the file — it does NOT modify the existing listener.

- [ ] **Step 1: Verify current end of install.js**

```bash
tail -5 src/Web/Grand.Web/wwwroot/assets/install/install.js
```
Expected: ends with the closing `});` of the existing `DOMContentLoaded` listener.

- [ ] **Step 2: Append popup JS**

Append the following block to the **end** of `src/Web/Grand.Web/wwwroot/assets/install/install.js`:

```javascript

// Welcome popup — shown once per browser session
(function () {
    var SESSION_KEY = 'installPopupDismissed';

    function showPopup() {
        var overlay = document.getElementById('install-overlay');
        var popup = document.getElementById('install-popup');
        if (!overlay || !popup) return;

        overlay.style.display = 'flex';
        popup.classList.add('install-popup--entering');

        popup.addEventListener('animationend', function onEnter() {
            popup.classList.remove('install-popup--entering');
            popup.removeEventListener('animationend', onEnter);
        });
    }

    function hidePopup() {
        var overlay = document.getElementById('install-overlay');
        var popup = document.getElementById('install-popup');
        if (!overlay || !popup) return;

        popup.classList.remove('install-popup--entering');
        popup.classList.add('install-popup--leaving');

        popup.addEventListener('animationend', function onLeave() {
            overlay.style.display = 'none';
            popup.classList.remove('install-popup--leaving');
            popup.removeEventListener('animationend', onLeave);
            try {
                sessionStorage.setItem(SESSION_KEY, '1');
            } catch (e) { /* sessionStorage unavailable — silent fail */ }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        var closeBtn = document.getElementById('install-popup-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', hidePopup);
        }

        var shouldShow = false;
        try {
            shouldShow = !sessionStorage.getItem(SESSION_KEY);
        } catch (e) {
            shouldShow = true; // sessionStorage unavailable: show popup anyway
        }

        if (shouldShow) {
            showPopup();
        }
    });
}());
```

- [ ] **Step 3: Verify JS was appended**

```bash
grep -n "SESSION_KEY\|showPopup\|hidePopup\|install-popup--entering\|install-popup--leaving" src/Web/Grand.Web/wwwroot/assets/install/install.js
```
Expected: 6+ matches — `SESSION_KEY`, `showPopup`, `hidePopup`, `install-popup--entering` (×2), `install-popup--leaving` (×2).

- [ ] **Step 4: Verify JS syntax is valid (Node.js required)**

```bash
node --check src/Web/Grand.Web/wwwroot/assets/install/install.js && echo "Syntax OK"
```
Expected: `Syntax OK`

If Node.js is not available, skip to Step 5.

- [ ] **Step 5: Commit**

```bash
git add src/Web/Grand.Web/wwwroot/assets/install/install.js
git commit -m "Add install welcome popup JS logic"
```

---

### Task 4: End-to-end verification

**Files:** none — read-only verification

This task has no automated test framework — the feature is pure browser UI. Verify using browser dev tools against a running instance or by inspecting the built files.

- [ ] **Step 1: Verify all three files contain popup code**

```bash
grep -c "install-popup" src/Web/Grand.Web/wwwroot/assets/install/style.css && \
grep -c "install-popup" src/Modules/Grand.Module.Installer/Views/Install/Index.cshtml && \
grep -c "install-popup" src/Web/Grand.Web/wwwroot/assets/install/install.js
```
Expected: three lines, each showing a count ≥ 1.

- [ ] **Step 2: Confirm overlay is hidden by default in CSS**

```bash
grep -A2 "\.install-overlay" src/Web/Grand.Web/wwwroot/assets/install/style.css | head -6
```
Expected: `display: none` appears in the `.install-overlay` rule.

- [ ] **Step 3: Confirm popup HTML IDs match JS selectors**

IDs in HTML: `install-overlay`, `install-popup`, `install-popup-close`

```bash
grep "getElementById" src/Web/Grand.Web/wwwroot/assets/install/install.js | grep -E "install-overlay|install-popup|install-popup-close"
```
Expected: lines referencing `install-overlay`, `install-popup`, and `install-popup-close`.

- [ ] **Step 4: Manual browser checklist (run against a live `/install` page)**

Start MongoDB and run `Grand.Web`, then open `http://localhost:[port]/install` in a browser:

1. **Fresh tab** → popup appears with slide-up animation, background is blurred, form is not clickable ✓
2. **Click Close** → popup slides down and disappears, form becomes interactive ✓
3. **Refresh the page** → popup does NOT appear ✓
4. **Open DevTools → Application → Session Storage** → key `installPopupDismissed` = `'1'` is present after closing ✓
5. **Open a new tab** to `/install` → popup appears again (new session) ✓

---

### Task 5: Push branch and open PR

- [ ] **Step 1: Verify commit history on branch**

```bash
git log --oneline ai-test/install-popup
```
Expected: at least 4 commits — spec, CSS, HTML, JS.

- [ ] **Step 2: Push branch**

```bash
git push -u origin ai-test/install-popup
```

- [ ] **Step 3: Open PR**

`gh` CLI is not installed. Open the PR manually at:

```
https://github.com/vladyslavavramchuk/grandnode2/compare/ai-test/develop...ai-test/install-popup
```

**Title:** `Add welcome popup to /install page`

**Body:** `Shows a session-once welcome popup on /install with slide-up/down animations, blurred backdrop, and a Close button. Pure client-side — no server changes.`
