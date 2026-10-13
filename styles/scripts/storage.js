const STORAGE_KET = 'student_finance_records';

export function loadRecords(){
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error('Error loading records', e);
        return [];
    }
    
}

export function saveRecords(records){
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
        console.error('Error saving records', e);
    }
    }
}