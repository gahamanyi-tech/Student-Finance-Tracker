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
        if(sortVal === 'date-asc') return new Date(a.date) - new Date(b.date);
        if(sortVal === 'amount-desc') return b.amount - a.amount;
        if(sortVal === 'amount-asc') return a.amount - b.amount;
        if(sortVal === 'desc-az') return a.description.localeCompare(b.description);
        return 0;
    });

    tbody.innerHTML = '';
    if(filtered.length === 0){
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No records found.</td></tr>';

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
        if(count > maxCount) {maxCount = count; topCat = cat; }
    }
    statTopCat.textContent = topCat;

    if (sumAmount > budgetCap){
        budgetAlert.setAttribute('aria-live', 'assertive');
        budgetAlert.textContent = `Warning! Budget cap of $${budgetCap} exceeded. Total spent: $${sumAmount.toFixed(2)}`;
    }else {
        budgetAlert.setAttribute('aria-live', 'polite');
        budgetAlert.textContent = `You are within your budget cap. Remaining: $${(budgetCap - sumAmount).toFixed(2)}`;

    }

    saveRecords(records);

}

function setupEventListeners(){
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('record-id').value;
        const description = document.getElementById('description').value.trim();
        const amount = parseFloat(document.getElementById('amount').value);
        const category = document.getElementById('category').value;
        const date = document.getElementById('date').value;

        const validation = validateRecord({ description, amount, date});
        const descError = document.getElementById('desc-error');
        const amountError = document.getElementById('amount-error');
        const dateError = document.getElementByID('date-error');

        if (descError) descError.textContent = validation.errors.description || '';
        if (amountError) amountError.textContent = validation.errors.amount || '';
        if (dateError) dateError.textContent = validation.errors.date || '';
        
        if (!validation.isValid) return;

        if (id) {
            records = records.map(r => r.id === id ? {...r, description, amount, category, date, updatedAt: new Date().toISOString()} :r); 
            editingId = null;
            document.getElementById('form-title').textContent = 'Add New Transaction';
            document.getElementById('submit-btn').textContent = 'Save Record';

        } else {
            const newRecord = {
                id: 'txn_' + Date.now(),
                description,
                amount,
                category,
                date,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            records.push(newRecord);
        }
        form.reset();
        document.getElementById('record-id').value = '';
        render();
    });
    searchInput.addEventListener('input', render);
    sortSelect.addEventListener('change', render);

    tbody.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        if (e.target.classList.contains('delete-btn')){
            if (confirm('Are you sure you want to delete this record?')){
                records = records.filter(r => r.id !== id);
                render();
            }
        } else if (e.target.classList.contains('edit-btn')){
            const rec = records.find(r => r.id === id);
            if (rec){
                document.getElementById('record-id').value = rec.id;
                document.getElementById('description').value = rec.description;
                document.getElementById('amount').value = rec.amount;
                document.getElementById('category').value = rec.category;
                document.getElementById('date').value = rec.date;
                document.getElementById('form-title').textContent = 'Edit Transaction';
                document.getElementById('submit-btn').textContent = 'Update Record';
                window.location.hash = '#form-section';
            }
        }
    });
    
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(records, null, 2));
            const dLAnchor = document.createElement('a');
            dLAnchor.setAttribute("href", dataStr);
            dLAnchor.setAttribute("download", "finance_records.json");
            document.body.appendChild(dLAnchor);
            dLAnchor.click();
            dLAnchor.remove();
        });
    }

    const loadSeedBtn = document.getElementById('load-seed-btn');
    if (loadSeedBtn) {
        loadSeedBtn.addEventListener('click', async () => {
            try {
                const res = await fetch('seed.json');
                const seedData = await res.json();
                records = seedDate;
                render();
                alert('Seed data loaded successfully!');
            } catch (err) {
                alert('Failed to load seed.json')
            }
        });

    }

    const budgetInput = document.getElementById('budget-cap-input');
    if (budgetInput) {
        budgetInput.addEventListener('input', (e) => {
            budgetCap = parseFloat(e.target.value) || 0;
            render();
        });
    }

}

init ();
