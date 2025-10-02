// src/utils/helpers.ts

export const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US');
};

export const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

export const isEmpty = (value: string): boolean => {
    return value.trim() === '';
};