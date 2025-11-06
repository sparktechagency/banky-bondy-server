export const ENUM_PRODUCT_STATUS = {
    AVAILABLE: 'available',
    UNAVAILABLE: 'unavailable',
} as const;

export const ENUM_USER_STATUS = {
    IN_PROGRESS: 'in-progress',
    BLOCKED: 'blocked',
};

export const ENUM_ORDER_STATUS = {
    PENDING: 'PENDING',
    WAITING_FOR_PICK: 'WAITING_FOR_PICK',
    CANCELED: 'CANCELED',
    ACCEPTED: 'ACCEPTED',
    PICKED: 'PICKED',
    SHIPPED: 'SHIPPED',
    DELIVERED: 'DELIVERED',
    COMPLETED: 'COMPLETED',
};

export const ENUM_NOTIFICATION_TYPE = {
    COURSE: 'COURSE',
    FEEDBACK: 'FEEDBACK',
    CLASS: 'CLASS',
    ORDER: 'ORDER',
    GENERAL: 'GENERAL',
    PAYMENT: 'PAYMENT',
};

export const ENUM_TRANSACTION_TYPE = {
    DONATION: 'Donation',
};
export const ENUM_PAYMENT_PURPOSE = {
    DONATE: 'DONATE',
    SUBSCRIPTION: 'SUBSCRIPTION',
};

export const ENUM_PAYMENT_STATUS = {
    PAID: 'PAID',
    UNPAID: 'UNPAID',
};

export const ENUM_TEST_TYPE = {
    THEORY: 'THEORY',
    ADI: 'ADI',
};
