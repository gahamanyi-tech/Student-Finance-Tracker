const DESC_REGEX = /^\S(?:.*\S)?$/;

const AMOUNT_REGEX = /^(0|[1-9]\d*)(\.\d{1,2})?$/;

const DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

const CATEGORY_REGEX = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;

const ADVANCED_DUPLICATE_WORD_REGEX = /\b(\w+)\s+\1\b/i;

export function validateDescription(val) {
    if (!val || val.trim() === '') return "Description cannot be empty.";
    if (!DESC_REGEX.test(val)) return "Avoid leading or trailing whitespace.";
    if (ADVANCED_DUPLICATE_WORD_REGEX.test(val)) return "Advanced warning: contains duplicate consecutive words. ";
    return null;
 
}

export function validateAmount(val) {
    if (val === '' || val === null) return "Amount is required.";
    if (!AMOUNT_REGEX.test(String(val))) return "Enter a valid positive number (max 2 decimal places)."
    if (parseFloat(val) <= 0) return "Amount must be greater than zero.";
    return null;
}

export function validateDate(val) {
    if (!val) return "Date is required.";
    if (!DATE_REGEX.test(val)) return "Use valid YYYY-MM-DD format.";
    return null;
}

export function validateCategory(val) {
    if(!val || !CATEGORY_REGEX.test(val)) return "Invalid category slection.";
    return null;
}