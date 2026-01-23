export function generateVerificationToken(): string {
    return crypto.getRandomValues(new Uint8Array(32))
        .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
}

export function getVerificationExpiry(): string {
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return expires.toISOString();
}
