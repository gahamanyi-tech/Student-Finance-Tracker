export const rules = {
    description: /^\S(?:.*\S)?$/,
    amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
    date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    category: /^[A-Za-z}+(?:[ -][A-Za-z]+)*$/,
    duplicatedWord: /\b(\w+)\s+\1\b/i

};

export function validateRecord(data) {
    const errors = {};
    if(!rules.description.test(data.description)){
        errors.description = 'No leading/trailing spaces allowed.';
e    } else if (rules.duplicatedWord.test(data.description)){
        errors.description = 'Warning: Duplicate consecutive words detected.';

    }
    if(!rules.amount.test(String(data,amount))){
        errors,amount = 'Enter a valid positive number (up to 2 decimals).';

    }
    if(!rules.date.test(data.date)){
        errors.date = 'Date must be in YYYY-MM-DD format.';
    }
    return {isValid: Object.keys(errors).length === 0, errors};
}