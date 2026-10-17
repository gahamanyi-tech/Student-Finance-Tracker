import { getTransactions, saveTransactions, addTransaction, deleteTransaction} from './storage.js';
import { validateDescription, validateAmount, validateDate } from './validators.js';
import { compileSearchPattern, highlightMatch } from './search.js';

document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('transaction-form');
    const descInput = document.getElementById('desc-input');
    const amountInput = document.getElementById('amount-input');
    const categoryInput = document.getElementById('category-input');
    const dateInput = document.getElementById('date-input');
    const recordsTbody = document.getElementById('records-tbody');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const statCount = document.getElementById('stat-count');
    const statSum = document.getElementById('stat-sum');
    const statTopCat = document.getElementById('stat-top-cat');
    const announcer = document.getElementById('announcer');


    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.app-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (!href || !href.startsWith('#')) return;
            e.preventDefault();

            const targetId = href.substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                sections.forEach(sec => sec.classList.remove('active'));
                navLinks.forEach(nav => nav.classList.remove('active'));
                targetSection.classList.add('active');
                link.classList.add('active');
            }
        });
    });

    let transactions = getTransactions();

    function updateUI() {
        renderRecords(transactions);
        updateStats(transactions)
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const desc = descInput.value.trim();
        const amount = parseFloat(amountInput.value);
        const category = categoryInput.value;
        const date = dateInput.value;

        if (!validateDescription(desc) || !validateAmount(amount) || !validateDate(date)){
            alert('Please check your inputs. Ensure description is clean, amount is positive, and date is valid.');
            return;
        }

        const newTx = {
            id: Date.now().toString(),
            description: desc,
            amount: amount,
            category: category,
            date: date
        };

        addTransaction(newTx);
        transactions = getTransactions();
        updateUI();

        form.reset();
        announcer.textContent = "New transaction successfully added.";

        document.querySelector('a[href="#records"]').click();
    });

    function renderRecords(data) {
        recordsTbody.innerHTML = '';

        if (data.length === 0) {
            recordsTbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #64748b;">No transaction records found.</td.</tr>`;
            return;
        
        }

        data.forEach(tx => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${escapeHtml(tx.description)}</td>
                <td>$${Number(tx.amount).toFixed(2)}</td>
                <td>${escapeHtml(tx.category)}</td>
                <td>${escapeHtml(tx.date)}</td>
                <td><button class="btn delete-btn" data-id="${tx.id}" style="background: #ef4444; color: white; padding: 4px 8px; border: none; border-radius: 4px; cursor: pointer;">Delete</button></td>

            `;
            recordsTbody.appendChild(tr);

        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                deleteTransaction(id);
                transactions = getTransactions();
                updateUI();
                announcer.textContent = "Transaction deleted.";
            });
        });
    }

    function updateStats(data) {
        statCount.textContent = data.length;

        const totalSum = data.reduce((sum, tx) => sum + Number(tx.amount), 0);
        statSum.textContent = `$${totalSum.toFixed(2)}`;

        if (data.length > 0) {
            const catCounts = {};
            data.forEach(tx => {
                catCounts[tx.category] = (catCounts[tx.category] || 0) + Number(tx.amount);               
            });
            const topCategory = Object.keys(catCounts).reduce((a, b) => catCounts[a] > catCounts[b] ? a : b);
            statTopCat.textContent = topCategory;
        } else {
            statTopCat.textContent = 'None';
        }
    }

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        try {
            const regex = compileSearchPattern(query);
            const filtered = transactions.filter(tx => tx.description.toLowerCase().includes(query.toLowerCase()));
            renderRecords(filtered);
        } catch {
            
            const filtered = transactions.filter(tx => tx.description.toLowerCase().includes(query.toLowerCase()));
            renderRecords(filtered);
        }
    });

    sortSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        let sorted = [...transactions];

        if (val === 'date-desc') {
            sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (val === 'date-asc') {
            sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (val === 'amount-desc') {
            sorted.sort((a, b) => b.amount - a.amount);
        } else if (val === 'amount-asc') {
            sorted.sort((a, b) => a.amount - b.amount);
        } else if (val === 'desc-az') {
            sorted.sort((a, b) => a.description.localeCompare(b.description));
        }

        renderRecords(sorted);
    });

    function escapeHtml(str) {
        return str.replace(/[&<>'"]/g,
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'}[tag] || tag)
        );
    }

    updateUI();
});