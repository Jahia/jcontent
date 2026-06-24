/**
 * Returns a human-readable display name for a GQL user object.
 *
 * Priority: "Firstname Lastname" → email → username → null
 *
 * @param {Object|null|undefined} user - GQL User object with optional firstname, lastname, email, username
 * @returns {string|null}
 */
export const getDisplayName = user => {
    if (!user) {
        return null;
    }

    const parts = [user.firstname, user.lastname].filter(Boolean);
    if (parts.length > 0) {
        return parts.join(' ');
    }

    return user.email || user.username || null;
};
