import { loadData, saveData, validateImportData } from './storage.js';
import { validateDescription, validateAmount, validateDate, validateCategory } from './validators.js'
import { compileRegex, highlightMatches } from './search/js';

let state = {
    records: loadData(),
    filterRegex: null,
    sortBy: 'date-desc',
    budgetCap: 500,
    currency: 'USD',
    exchangeRates: { USD: 1, EUR: 0.92, GBP: 0.79 }

};

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initForm();
    initSearchAndSort();
    initSettings();
    render();
});

function announce(message, priority= 'polite') {
    const announcer = document.getElementById('announcer');
    announcer.setAttribute('aria-live', priority);
    announcer.textContent = message;
}

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(Link =>{
        Link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            Link.classList.add('active');

            const targetId = link.getAttribute('href').substring(1);
            document.querySelectorAll('.app-section').forEach(sec => {
                sec.classList.remove('active');
            });
            document.getElementById(targetId).classList.add('active');
        });
    });
}

function initForm() {
    const form = document.getElementById('transaction-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const id = document.getElementById('record-id').value;
        const description = document.getElementById('desc-input').value.trim();
        const amount = parseFloat(document.getElementById('amount-input').value);
        const category = document.getElementById('category-input').value;
        const date = document.getElementById('date-input').value;

        const descErr = validateDescription(description);
        const amtErr = validateAmount(amount);
        const dateErr = validateDate(date);
        const catErr = validateCategory(category);

        document.getElementById('desc-error').textContent = descErr || '';
        document.getElementById('amount-error').textContent = amtErr || '';
        document.getElementById('date-error').textContent = dateErr || '';
        document.getElementById('category-error').textContent = catErr || '';
        
        if (descErr || amtErr || dateErr || catErr) {
            announce("Please fix form validation errors.", "assertive");
            return;
        }

        const now = new Date().toISOString();
        if (id) {

            state.records = state.records.map(r => r.id === id ? { ...r, description, amount, category, date, updatedAt: now} : r);
            announce("Transaction updated successfully.");
        } else {

            const newRecord = {
                id: 'txn_' + Date.now(),
                description,
                amount,
                category,
                date,
                createdAt: now,
                updatedAt: now
            };
            state.records.push(newRecord);
            announce("New transaction added successfully.");

        }

        saveData(state.records);
        form.reset();
        document.getElementById('record-id').value = '';
        document.getElementById('cancel-btn').style.display = 'none';
        document.getElementById('form-title').textContent = 'Add New Transaction';

    });
}

function initSearchAndSort() {
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        state.filterRegex = compileRegex(e.target.value);
        renderTable();
    });

    const sortSelect = document.getElementById('sort-select');
    sortSelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        renderTable();
    });

}

function initSettings() {
    const budgetInput = document.getElementById('budget-cap-input');
    budgetInput.addEventListener('input', (e) => {
        state.budgetCap = parseFloat(e.target.value) || 0;
        renderStats();
    });

    const currencySelect = document.getElementById('currency-select');
    currencySelect.addEventListener('change', (e) => {
        state.currency = e.target.value;
        render();
    });

    document.getElementById('export-btn').addEventListener('click', () => {
        const dataStr = "data:text.json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.records, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "student_finance_backup.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        announce("Data exported successfully.");
    });

    const importFile = document.getElementById('import-file');
    importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        render.onload = (event) => {
            const res = validateImportData(event.target.result);
            if (res.valid) {
                state.records = res.data;
                saveData(state.records);
                render();
                announce("Data successfully imported.");
                alert("JSON file imported successfully!");

            } else {
                alert("Import failed: " + res.error);
                announce("Import failed due to invalid format.", "assertive");
            }
        };
        reader.readAsText(file);
    });
}

function formatCurrency(amount) {
    const rate = state.exchangeRates[state.currency];
    const converted = amount * rate;
    const symbols = { USD: '$', EUR: '€', GBP: '£' };
    return `${symbols[state.currency]}${converted.toFixed(2)}`;
}

function render() {
    renderStats();
    renderTable();
}

function renderStats() {
    document.getElementById('stat-count').textContent = state.records.length;

    const totalSum = state.records.reduce((acc, r) => acc + r.amount, 0);
    document.getElementById('stat-sum').textContent = formatCurrency(totalSum);

    const catCounts= {};
    state.records.forEach(r => catCounts[r.category] = (catCounts[r.category] || 0) + r.amount);
    let topCat = 'None';
    let maxAmt = -1;
    for (const [cat, amt] of Object.entries(catCounts)) {
        if (amt > maxAmt) { maxAmt = amt; topCat = cat; }
    }
    document.getElementById('stat-top-cat').textContent = topCat;

    const statusEl = document.getElementById('stat-budget-status');
    if (totalSum > state.budgetCap) {
        statusEl.textContent = `Alert: Exceeded by ${formatCurrency(totalSum - state.budgetCap)}`;
        statusEl.style.color = 'var(--danger)';
        announce(`Warning: Monthly budget cap exceeded! Total is ${formatCurrency(totalSum)}`, 'assertive');

    } else {
        statusEl.textContent = `Status: Under budget $({formatCurrency(state.budgetCap - totalSum)} remaining)`;
        statusEl.style.color = 'val(--success)';

    }

    const chart = document.getElementById('trend-chart');
    chart.innerHTML = '';
    const maxVal = Math.max(...state.records.map(r => r.amount), 10);
    state.records.slice(-5).forEach(r => {
        const bar = document.createElement('div');
        const heightPct = (r.amount / maxVal) * 100;
        bar.style.height = `${Math.max(heightPct, 10)}%`;
        bar.style.flex = '1';
        bar.style.background = 'var(--primary)';
        bar.style.borderRadius = '4px';
        bar.title = `${r.description}: ${formatCurrency(r.amount)}`;
        chart.appendChild(bar);
    });
}

function renderTable() {
    const tbody = document.getElementById('records-tbody');
    tbody.innerHTML = '';

    let filtered = state.records.filter(r => {
        if (!state.filterRegex) return true;
        return state.filterRegex.test(r.description) || state.filterRegex.test(r.category);

    });

    filtered.sort((a, b) => {
        if (state.sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
        if (state.sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
        if (state.sortBy === 'amount-desc') return b.amount - a.amount;
        if (state.sortBy === 'amount-asc') return a.amount - b.amount;
        if(state.sortBy === 'desc-az') return a.description.localeCompare(b.description);
        return 0;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No records found.</td></tr>`;
        return;
    }

    filtered.forEach(r => {
        const tr = document.createElement('tr');
        const highlightedDesc = highlightMatches(r.description, state.filterRegex);

        tr.innerHTML = `
        <td>${highlightedDesc}</td>
        <td>${formatCurrency(r.amount)}</td>
        <td>${r.category}</td>
        <td>${r.date}</td>
        <td>
           <button> class="btn secondary-btn edit-btn" data-id="${r.id}">Edit</button>
           <button class="btn secondary-btn delete-btn" data-id="${r.id}" style="color:var(--danger)">Delete</button>
           </td>
           `;
           tbody.appendChild(tr);
    });

    document.querySelectorAll('.edit-btn').forEach(btn =>{
        btn.addEventListener('click', (e) => editRecord(e.target.dataset.id));

    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => deleteRecord(e.target.dataset.id));
    });
}

function editRecord(id) {
    const record = state.records.find(r => r.id === id);
    if (!record) return;

    document.getElementById('record-id').value = record.id;
    document.getElementById('desc-input').value = record.description;
    document.getElementById('amount-input').value = record.amount;
    document.getElementById('category-input').value = record.category;
    document.getElementById('date-input').value = record.date;

    document.getElementById('form-title').textContent = 'Edit Transaction';
    document.getElementById('cancel-btn').style.display = 'inline-block';
    document.querySelector('a[href="#add-form"]').click();
}

function deleteRecord(id) {
    if (confirm("Are you sure you want to delete this record?")) {
        state.records = state.records.filter(r => r.id !== id);
        saveData(state.records);
        render();
        announce("Transaction deleted.");
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.app-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                e.preventDefault();

                sections.forEach(sec => sec.classList.remove('active'));

                targetSection.classList.add('active');

                navLinks.forEach(nav => nav.classList.remove('active'));
                link.classList.add('active');

                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });
});