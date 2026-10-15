export const rules = {
    description: /^\S(?:.*\S)?$/,
    amount: /^[1-9]\d*(\.\d{1,2})?$/,
    date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
    duplicatedWord: /\b(\w+)\s+\1\b/i

};

export function validateRecord(data) {
    const errors = {};

    if (!data.description || !rules.description.test(data.description)) {
        errors.description = 'Description cannot have leading/trailing spaces.';
    } else if (rules.duplicatedWord.test(data.escription)) {
        errors.description = 'Warning: Duplicate consecutive words detected.';
    }

    if (!data.amount || !rules.amount.test(String(data.amount))) {
        errors.amount = 'Enter a valid positive number greater than 0 (up to 2 decimals).';
    }

    if (!data.category || !rules.category.test(data.category)) {
        errors.category = 'Please select a valid category.';
    }

    if (!data.date || !rules.date.test(data.date)) {
        errors.date = 'Date must be in YYYY-MM-DD format.';
    }

    return {
        isvalid: Object.keys(errors).length === 0,
        errors
    };
}