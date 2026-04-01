PROMPT 1:
# Instructions
You are an expert in prompt engineering.

Given the following prompt, prepare it using best-practice structure (role, objective, etc.) and formatting to achieve a precise and comprehensive result. 
Stick strictly to the requested objective by carefully analyzing what is asked in the original prompt.

# Original Prompt:
crear un cronómetro y cuenta atrás. Toma como referencia: https://www.online-stopwatch.com/
Analiza como funciona y crea uno igual. version optimized specifically for GPT-5.4


Do it using the seed files `index.html` and `script.js` provided.

index.html:
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reverse String</title>    
</head>
<body>
<script src="script.js"></script>
</body>
</html>

script.js:
now empty

You should modify index.html, script.js and create other files if it is necesary. The web page should be modern and minimalist. you should return all files (created and modified) 

-----------------
PROMPT GENERADO:

# Role
You are a senior front-end engineer specialized in building production-ready static web applications with clean architecture, precise JavaScript logic, and polished minimalist UI.

# Objective
Create a complete web application that includes:

1. A **Stopwatch (cronómetro)** that counts upward.
2. A **Countdown Timer (cuenta atrás)** that counts downward from a user-defined time.

Use **https://www.online-stopwatch.com/** as functional inspiration and replicate the core user experience as closely as possible, but with a **modern, minimalist, responsive** design instead of copying the visual style literally.

The result must be optimized for **GPT-5.4** and must return **all created and modified files in full**.

# Project Constraints
You must use and modify these seed files:

## `index.html`
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reverse String</title>    
</head>
<body>
<script src="script.js"></script>
</body>
</html>

script.js
// empty

You may create additional files if needed, for example:
styles.css

# Functional Requirements

## General
- Build a single static web page.
- The app must allow the user to switch clearly between:
  - Stopwatch mode
  - Countdown mode
- The interface must be intuitive and work well on desktop and mobile.
- No frameworks such as React, Vue, Angular, etc.
- Use plain HTML, CSS, and JavaScript only.

## Stopwatch

Implement a stopwatch with:
- Start
- Pause
- Resume
- Reset

### Behavior
- Display time in a clear digital format.
- At minimum show: `HH:MM:SS`
- Preferably include milliseconds or centiseconds for a more realistic stopwatch feel.
- The stopwatch must continue accurately without drifting noticeably.
- Reset must return the time to zero.

## Countdown Timer

Implement a countdown timer with:
- Inputs for user-defined time:
  - Hours
  - Minutes
  - Seconds
- Start
- Pause
- Resume
- Reset

### Behavior
- The countdown decreases in real time.
- When it reaches zero:
  - stop automatically
  - show a clear visual end state
  - optionally play a simple alert sound if easy to implement without external dependencies
- Prevent invalid values.
- Handle empty inputs gracefully.
- If the entered time is zero, do not start the countdown.

# UX / UI Requirements
- The page must be modern and minimalist.
- Centered main layout.
- Clear typography.
- Strong visual hierarchy.
- Large, easy-to-read timer display.
- Clean buttons with good spacing.
- Responsive design for mobile and desktop.
- Smooth mode switching between stopwatch and countdown.
- Use accessible labels and semantic structure.
- Avoid clutter.

# Technical Requirements
- Organize code cleanly.
- Separate concerns properly:
  - HTML structure
  - CSS styling
  - JavaScript behavior
- Use DOM manipulation with clean event handling.
- Avoid global chaos and duplicated logic.
- Timer logic must be robust and based on timestamps / elapsed-time calculation rather than relying only on naive interval increments.
- The code should be production-oriented for a small static app:
  - readable
  - maintainable
  - consistent naming
  - comments only where useful

# Deliverables
Return all files in full, not partial snippets.

At minimum:
- `index.html`
- `script.js`

And also any additional file you create, such as:
- `styles.css`

# Output Format
Return the answer in this exact structure:

## `index.html`
```html
<!-- full file -->

# Output Format

## `styles.css`
```html
<!-- full file -->

## `script.js`
```html
<!-- full file -->

If you create more files, include them too using the same format.

# Important Execution Notes
- Do not provide explanation before the files.
- Do not provide pseudo-code.
- Do not omit any file content.
- Do not return partial implementations.
- Do not change the task into a simplified demo.
- Deliver a complete working solution.