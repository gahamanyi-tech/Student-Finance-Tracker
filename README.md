# Student Finance Tracker

A lightweight, modular, client-side web application designed to help students easily manage, track, and analyse their daily finances, expenses, and academic budgets.

Built using modern vanilla JavaScript (ES modules) and semantic HTML/CSS with local data persistence

---

## Features

* **Transaction Management**: Add new income or expense records with custom description, amounts, categories, and dates.
* **Smart Date Formatting**: Automatically translates raw storage dates into clean, human-readable formats (e.g., *Oct10,2026*).
* **Data Persistence**: Utilizes browser `localStorage` to securely save your financial records across sesions.
* **Advanced Search & Regex Filtering**: Filter transactions instantly using plain text or powerful Regular Expressions (Regex).
* **Dynamic Sorting**: Sort records by date (newest/oldest), amount (highest/lowest), or description alphabetically.
* **Dashboard Analytics**: Real-time stats showing total transaction count, total sum balance, and your top spending category.
* **JSON Export**: Export all your stored transaction data into a backup JSON file directly from the Settings tab.
* **Automated Test Suite**: Includes a built-in `tests.html` verification runner for grading and validation checks.

--- 

##  Project Structure

```text
Student-Finance-Tracker/        
|
|-index.html           # Main application interface and navigation
|-tests.html           # Automated validation and testing suite
|-styles/
  |_styles.css         # Resposive application styling
|_scripts/
  |_app.js             # Core application logic, DOM rendering, and event handlers
  |_storage.js         # localStorage wrapper functions
  |_validators.js      # Input validation rules (descriptions, amounts, dates, categories)
  |_search.js          #Search pattern compilation and regex handling






















