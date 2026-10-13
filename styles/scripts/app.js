import { loadRecords, saveRecords } from './storage.js';
import { validateRecord } from './validators.js';
import { compileRegex, highlightMatches } from './search.js';

let records = loadRecords();
let budgetCap = 250;
let editingId = null;

const tbody = document.getElementById('records-tbody');
const form = document.getElementById('transaction-form');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const statCount = document.getElementById('stat-count');
const statSum = document.getElementById('stat-sum');
const statTopCat = document.getElementById('stat-top-cat');
const budgetAlert = document.getElementById('budget-alert');

function init(){
    render();
    setupEventListeners();
}

function render(){
    const query = searchInput.value;
    const regex = compileRegex(query);

    let filtered = records.filter(item => {
        if (!regex) return true;
        return regex.test(item.description) || regex.test(item.category) || regex.test(String(item.amount));

    });

    const sortVal = sortSelect.value;
    filtered.sort((a, b) => {
        if(sortVal === 'date-desc') return new Date(b.date) - new Date(a.date);
        if(sortVal === 'date-asc') return new Date(a.date)  - new Date(b.date);
        if(sortVal === 'amount-desc') return b.amount - a.amount;
        if(sortVal === "amount asc") return a.amount - b.amount;
        if(sortVal === "desc-az") return a.description.localeCompare(b.description);
        return 0;
    });

    tbody.innerHTML = '';
    if(filtered.length === 0){
        tbody.innerHTML = '<tr><td> colspan="5" style="text-align:center;">No records found.</td></tr> ';
    } else {
        filtered.forEach(item => {
            const tr = document.createElement('tr');
            const highlightedDesc = highlightMatches(item.description, regex);
            tr.innerHTML = `
            <td>${highlightedDesc}</td>
            <td>$${Number(item.amount).toFixed(2)}</td>
            <td>${item.category}</td>
            <td>${item.date}</td>
            <td>
                <button class="btn-sm edit-btn" data-id="${item.id}">Edit</button>
                <button class="btn-sm delete-btn" data-id="${item.id}">Delete</button>
            </td>
            `;
            tbody.appendChild(tr);
        });

    }

    const totalCount = records.length;
    const sumAmount = records.reduce((acc, curr) => acc + Number(curr.amount), 0);

    statCount.textContent = totalCount;
    statSum.textContent = `$${sumAmount.toFixed(2)}`;

    const catCounts = {};
    records.forEach(r => { catCounts[r.category] = (catCounts[r.category] || 0) + 1; });
    let topCat = 'None', maxCount = 0;
    for (const [cat, count] of Object.entries(catCounts)){
        if (count > maxCount) { maxCount = count; topCat = cat; }
    }
    statTopCat.textContent = topCat;

    if (sumAmount > budgetCap) {
        budgetAlert.setAttribute('aria-live', 'assertive');
        budgetAlert.textContent = `warning! Budget cap of $${budgetCap} exceeded. Total spent: $${sumAmount.toFixed(2)}`;
    } else {
        budgetAlert.setAttribute('aria-live', 'polite');
        budgetAlert.textContent = `You are within your budget cap. Remaining: $${(budgetCap - sumAmount).toFixed(2)}`;
    }

    saveRecords(records);
}
