import { getTransactions, saveTransactions, addTransaction, deleteTransaction} from './storage.js';
import { validateDescription, validateAmount, validateDate, validateCategory } from './validators.js';
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
        const amountVal = amountInput.value.trim();
        const category = categoryInput.value;
        const date = dateInput.value;

        if (validateDescription(desc) || validateAmount(amountVal) || validateDate(date) || validateCategory(category)) {
            alert('Please check your inputs. Ensure description is clean, amount is positive,  date is valid, and category is selected');
            return;
        }

        const newTx = {
            id: Date.now().toString(),
            description: desc,
            amount: parseFloat(amountVal),
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
            const tr = document.createElement('tr');
            tr.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #64748b;">No transaction records found.</td></tr>`;
            recordsTbody.appendChild(tr);
            return;
        
        }

        data.forEach(tx => {
            const tr = document.createElement('tr');

           let formattedDate = tx.date;
           try{
            const [year, month, day] = tx.date.split('-');
            if (year && month && day) {
                const dateObj = new Date(year, month -1, day);
                formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            }
           } catch (e) {
               formattedDate = tx.date;
           }

                
           const tdDesc = document.createElement('td');
           tdDesc.textContent = tx.description;

           const tdAmount = document.createElement('td');
           tdAmount.textContent = `$${Number(tx.amount).toFixed(2)}`;

           const tdCategory = document.createElement('td');
           tdCategory.textContent = tx.category;

           const tdDate = document.createElement('td');
           tdDate.textContent = formattedDate;

           const tdActions = document.createElement('td');
           const deleteBtn = document.createElement('button');
           deleteBtn.type = 'button';
           deleteBtn.className = 'btn delete-btn';
           deleteBtn.textContent = 'Delete';
           deleteBtn.setAttribute('data-id', tx.id);
           deleteBtn.style.cssText = 'background: #ef4444; color: white; padding: 4px 8px; border: none; border-radius: 4px; cursor: pointer;';

           deleteBtn.addEventListener('click', () => {
            deleteTransaction(tx.id);
            transactions = getTransactions();
            updateUI();
            announcer.textContent = "Transaction deleted"
           });

           tdActions.appendChild(deleteBtn);

           tr.appendChild(tdDesc);
           tr.appendChild(tdAmount);
           tr.appendChild(tdCategory);
           tr.appendChild(tdDate);
           tr.appendChild(tdActions);

           recordsTbody.appendChild(tr);
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
            const filtered = transactions.filter(tx => regex.test(tx.description) || regex.test(tx.category));
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