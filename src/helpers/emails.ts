import { isNullOrEmptyString } from "./typecheckers";

export function isValidEmail(email: string) {
    return !isNullOrEmptyString(email) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const freeEmailNotAllowedMessage = "Please use a work email, free emails are not allowed";