Markdown

#Student Finance Tracker

A mobile-first, highly accessible web application built with vanilla HTML5, CSS3, and modern JAvaScript to help univeristy students track daily

## Live Demo



## Features & Functionality
* **Dashboard Analytics:** Real-time calculations for total spent, total records, top spending category, and monthly budget warnings.
* **CRUD Operationd:** Add, edit, delete, and sort fiancial records seamlessly.
* **Regex Live Search & Validation:** Instant regex-powered search with safe match highlighting, plus strict validation rules (currency formats, date constraints, and duplicate word detection).
* **Data Persistence:** Automatic synchronization with browser `localStorage`.
* **JSON Import/Export:** Backup your financial data or load sample datasets via JSON files.
* **Accessibility (a11y) First:** Fully keyboard navigable, ARIA live regions for screen readers, and a skip-to-content navigation link.

---

## Regex Catalog
The application implements multiple robust regular expressions to ensure data integrity and powerful search:
1. **Currency Validation:** `/^\d+(\.\d{2})?$/` -Ensures valid monetary inputs with optional two-decimal-point pricing.
2. **Date Format Verification:** `/^\d{4}-\d{2}-\d{2}$/` - Restricts entry dates to strict `YYYY-MM-DD` standards.
3. **Advanced Back-Reference (Duplicate Word Check):** `/\b(\w+)\s+\1\b/i` - Detects accidental repeated words in descriptions using back-referencing.
4. **Live Search Compiler:** Safely parses user query input into dynamic RegExp objects with fallback error handling.

---

## Keyboard Navigation Map
* **`Tab` / `Shift + Tab`:** Navigate sequentially through interactive elements, inputs, and table actions.
* **`Enter` / `Space`:** Activate buttons, toggle modals, or trigger form submissions.
* **`Escape`:** Close active modals or clear search filters.

---

## Project Architecture $ Setup
The project follows a clean, modular file structure:
```text
Student-finance-tracker/
|
|-index.html                    # Main application markup & semantic landmarks
|-tests.html                    # Automated assertion tests for regex rules
|-styles/
   |__main.css                  # Responsive styling, variables, glassmorphism, & breakpoints.
|__scripts/
   |-storage.js                 # LocalStorage & JSON Import/Export handling
   |-validatiors.js             # Regex rules & input validation logic
   |-search.js                  # Live regex filtering & text highlighting
   |_app.js                     # Core DOM manipulation, CRUD operations, & event listeners 




