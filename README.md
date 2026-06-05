# ⏱ CHRONO — Stopwatch Web Application

A sleek, mission-control-inspired stopwatch built entirely with **HTML5, CSS3, and Vanilla JavaScript** — no frameworks, no dependencies.

---

## 📋 Project Description

CHRONO is an interactive, browser-based stopwatch that lets users measure and record time intervals with centisecond precision. It features a dark industrial UI, smooth animations, and smart lap analytics (automatic best/slowest lap highlighting).

---

## ✨ Features

| Feature | Details |
|---|---|
| **Start** | Begin timing from zero or resume after a pause |
| **Pause** | Freeze the timer while preserving accumulated time |
| **Reset** | Return to `00:00:00.00` and clear all lap records |
| **Lap** | Snapshot the current time; newest lap appears at the top |
| **Best / Slow tags** | Automatically highlights the fastest and slowest lap durations |
| **Keyboard shortcuts** | `Space` = Start/Pause · `L` = Lap · `R` = Reset |
| **Responsive layout** | Works seamlessly on desktop and mobile |
| **Accurate timing** | Uses `performance.now()` + `requestAnimationFrame` — no drift |

---

## 🕐 Time Format

```
HH : MM : SS . cs
```

| Part | Meaning |
|---|---|
| `HH` | Hours (00 – 99) |
| `MM` | Minutes (00 – 59) |
| `SS` | Seconds (00 – 59) |
| `cs` | Centiseconds / hundredths of a second (00 – 99) |

**Example:** `00:01:25.47`

---

## 🛠 Technologies Used

- **HTML5** — semantic markup, ARIA attributes for accessibility
- **CSS3** — CSS custom properties, Grid/Flexbox, keyframe animations
- **Vanilla JavaScript (ES6+)** — `performance.now()`, `requestAnimationFrame`, DOM manipulation
- **Google Fonts** — *Share Tech Mono* (timer display) · *Barlow* (UI text)

---

## 📁 Folder Structure

```
📁 Stopwatch-Web-App/
│
├── index.html   ← App structure & markup
├── style.css    ← All styling, themes, and animations
├── script.js    ← Stopwatch logic (start, pause, reset, lap)
└── README.md    ← This file
```

---

## 🚀 Installation & Running

No build step or server required.

1. **Download / clone** the project folder.
2. Open `index.html` in any modern web browser (Chrome, Firefox, Edge, Safari).
3. That's it — the app runs entirely in the browser.

```bash
# Optional: serve locally with Python
cd Stopwatch-Web-App
python -m http.server 8080
# Then open http://localhost:8080
```

---

## 📖 Usage Instructions

| Action | How |
|---|---|
| Start the stopwatch | Click **START** or press `Space` |
| Pause the stopwatch | Click **PAUSE** or press `Space` |
| Resume after pause  | Click **START** or press `Space` |
| Record a lap        | Click **LAP** or press `L` (only while running) |
| Reset everything    | Click **RESET** or press `R` |
| Clear lap records   | Click the **CLEAR** button in the lap section |

> The **BEST** tag (green) highlights the fastest lap duration.  
> The **SLOW** tag (red) highlights the slowest lap duration.  
> Tags appear automatically once 2 or more laps are recorded.

---

## 🔮 Future Enhancements

- [ ] Export lap records as CSV / JSON
- [ ] Multiple named timers running simultaneously
- [ ] Sound / vibration feedback on lap
- [ ] Dark / light theme toggle
- [ ] Persistent lap history via `localStorage`
- [ ] Configurable countdown timer mode
- [ ] PWA support (offline, install to home screen)

---

## 👤 Author

Built as an internship project submission demonstrating:

- Clean, well-commented Vanilla JS
- Responsive CSS layout with custom design system
- Accessible HTML5 (ARIA roles, live regions)
- Accurate, drift-free timing via Web APIs

---

*CHRONO — because every millisecond counts.*
