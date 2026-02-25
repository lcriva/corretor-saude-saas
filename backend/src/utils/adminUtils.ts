export const ADMIN_EMAILS = [
    'lcriva@gmail.com',
    'thiagonogueira29@outlook.com'
];

/**
 * Verifica se um email pertence a um administrador
 */
export function isAdmin(email?: string): boolean {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email.toLowerCase());
}
