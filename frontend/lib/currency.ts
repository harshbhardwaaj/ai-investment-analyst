const EUROPEAN_SUFFIXES = [
    ".DE", ".PA", ".AS", ".MI", ".MC",
    ".L", ".SW", ".VI", ".BR", ".OL", ".ST", ".HE", ".CO",
]

export function getCurrencySymbol(ticker: string): string {
    return EUROPEAN_SUFFIXES.some(s => ticker.toUpperCase().endsWith(s)) ? "€" : "$"
}
