export function compileSearchPattern(query) {
    if (!query || query.trim() === '') {
        return new RegExp('', 'i');
    }
    try {
        return new RegExp(query, 'i');
    } catch (e) {
        return new RegExp(escapeRegExp(query), 'i');
    }
}

export function highlightMatch(text, query) {
    if (!query || !text) return text;
    try {
        const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
        return String(text).replace(regex, '<mark>$1</mark>');
    } catch (e) {
        return text;
    }
}

export function compileRegex(input, flags = 'i') {
    return compileSearchPattern(input);
}

export function highlightMatches(text, regex) {
    if (!regex || !text) return text;
    return String(text).replace(regex, (match) => `<mark>${match}</mark>`);
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}