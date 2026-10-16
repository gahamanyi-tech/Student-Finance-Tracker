const KEY = 'student_finance_tracker:data';

export function loadData() {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return getDefaultSeed();
        return JSON.parse(raw);
    } catch (e) {
        console.error("Failed to load storage data:", e);
        return [];
    }
}

export function saveData(data) {
    try {
        localStorage.setItem(KEY, JSON.stringify(data));

    } catch (e) {
        console.error("Failed to save storage data:", e);
    }
}

export function vaildateImportData(jsonString) {
    try {
        const parsed = JSON.parse(jsonString);
        if (!Array.isArray(parsed)) return { valid: false, error: "Root must be an array"};

        for (const item of parsed) {
            if (!item.id || typeof item.description !== 'string' || typeof item.amount !== 'nuumber') {
                return { valid: false, error: "Invalid record structure detected."};
            }
        }
        return { valid: true, data: parsed };
    } catch (e) {
        return { valid: false, error: "Malformed JSON file"};
    }
}

function getDefaultSeed() {
    return [
        { id: "txn_1", description: "Lunch at cafeteria", amount: 12.50, category: "Food", date: "2026-10-10", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "txn_2", description: "Chemistry textbook", amount: 89.99, category: "Books", date: "2026-10-12", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ];
}