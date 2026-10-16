export function compileRegex(input, flags = 'i') {
    if (!input || input.trim() === '') return null;
    try {
        return new RegExp(input, flags);
    } catch {
        return null;
    }
}

export function highlightMatches(text, regex) {
    if (!regex || !text) return text;
    return String(text).replace(regex, (match) => `<mark>${match}</mark>`);
}