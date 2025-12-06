const userClickCounts: Map<string, { count: number; lastReset: number }> =
    new Map();
const CLICK_LIMIT = 10; // max 10 requests
const WINDOW_MS = 60 * 1000; // per minute

export const checkRateLimit = (userId: string) => {
    const now = Date.now();
    const data = userClickCounts.get(userId);

    if (!data) {
        userClickCounts.set(userId, { count: 1, lastReset: now });
        return true;
    }

    if (now - data.lastReset > WINDOW_MS) {
        // Reset window
        userClickCounts.set(userId, { count: 1, lastReset: now });
        return true;
    }

    if (data.count >= CLICK_LIMIT) {
        return false; // limit exceeded
    }

    data.count += 1;
    userClickCounts.set(userId, data);
    return true;
};
