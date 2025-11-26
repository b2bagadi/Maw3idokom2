import { getMessage, Language, NotificationType } from '@/lib/i18n/notification-messages';

interface AppointmentData {
    customerName: string;
    businessName: string;
    serviceName: string;
    date: string;
    time: string;
    price: number;
    duration: number;
}

interface RescheduleData extends AppointmentData {
    oldDate: string;
    oldTime: string;
    newDate: string;
    newTime: string;
}

/**
 * Format phone number for WhatsApp (remove all non-numeric except +, then remove +)
 */
export function formatPhoneForWhatsApp(phone: string): string {
    let cleaned = phone.replace(/[^\d+]/g, '');
    cleaned = cleaned.replace(/^\+/, '');
    return cleaned;
}

/**
 * Replace placeholders in message template
 */
function replacePlaceholders(template: string, data: Record<string, any>): string {
    let result = template;
    Object.keys(data).forEach(key => {
        const placeholder = `{${key}}`;
        result = result.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), data[key]);
    });
    return result;
}

/**
 * Generate WhatsApp confirmation message
 */
export function generateConfirmationMessage(
    data: AppointmentData,
    language: Language = 'en'
): string {
    const messages = getMessage(language, 'confirmation');
    return replacePlaceholders(messages.whatsappBody, data);
}

/**
 * Generate WhatsApp cancellation message
 */
export function generateCancellationMessage(
    data: AppointmentData & { reason: string },
    language: Language = 'en'
): string {
    const messages = getMessage(language, 'cancellation');
    return replacePlaceholders(messages.whatsappBody, data);
}

/**
 * Generate WhatsApp reschedule message
 */
export function generateRescheduleMessage(
    data: RescheduleData & { reason: string },
    language: Language = 'en'
): string {
    const messages = getMessage(language, 'reschedule');
    return replacePlaceholders(messages.whatsappBody, data);
}

/**
 * Generate WhatsApp Web URL with pre-filled message
 */
export function generateWhatsAppLink(phoneNumber: string, message: string): string {
    const formattedPhone = formatPhoneForWhatsApp(phoneNumber);
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}
