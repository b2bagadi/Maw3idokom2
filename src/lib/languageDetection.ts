/**
 * Language detection and localization utilities for appointment notifications
 */

export type SupportedLanguage = 'en' | 'fr' | 'ar';

/**
 * Detect preferred language from phone number prefix
 * For North African countries (+212, +213), returns both fr and ar as options
 */
export function detectLanguageFromPhone(phone: string): SupportedLanguage {
    if (!phone) return 'en';

    // Morocco (+212), Algeria (+213) - French is more common for business
    if (phone.startsWith('+212') || phone.startsWith('+213')) {
        return 'fr';
    }

    // France (+33)
    if (phone.startsWith('+33')) {
        return 'fr';
    }

    // Tunisia (+216), Morocco can also use Arabic
    if (phone.startsWith('+216')) {
        return 'ar';
    }

    // Saudi Arabia (+966), UAE (+971), Egypt (+20)
    if (phone.startsWith('+966') || phone.startsWith('+971') || phone.startsWith('+20')) {
        return 'ar';
    }

    // Default to English for all other countries
    return 'en';
}

/**
 * Get all supported languages for a phone prefix
 * Returns array to support bilingual regions
 */
export function getSupportedLanguages(phone: string): SupportedLanguage[] {
    if (!phone) return ['en'];

    // Morocco and Algeria support both French and Arabic
    if (phone.startsWith('+212') || phone.startsWith('+213')) {
        return ['fr', 'ar'];
    }

    // Tunisia
    if (phone.startsWith('+216')) {
        return ['ar', 'fr'];
    }

    // France
    if (phone.startsWith('+33')) {
        return ['fr'];
    }

    // Arabic-speaking countries
    if (phone.startsWith('+966') || phone.startsWith('+971') || phone.startsWith('+20')) {
        return ['ar'];
    }

    return ['en'];
}

interface MessageVariables {
    name: string;
    service: string;
    date: string;
    time: string;
    reason?: string;
    businessName?: string;
}

/**
 * Get localized message for appointment notifications
 */
export function getLocalizedMessage(
    messageKey: 'appointmentConfirmed' | 'appointmentRejected' | 'appointmentRescheduled',
    language: SupportedLanguage,
    variables: MessageVariables
): string {
    const messages = {
        appointmentConfirmed: {
            en: `Hello {name}, your appointment for {service} on {date} at {time} is confirmed. Thank you for choosing {businessName}!`,
            fr: `Bonjour {name}, votre rendez-vous pour {service} le {date} à {time} est confirmé. Merci d'avoir choisi {businessName}!`,
            ar: `مرحبا {name}، تم تأكيد موعدك لـ {service} في {date} الساعة {time}. شكرا لاختيارك {businessName}!`
        },
        appointmentRejected: {
            en: `Hello {name}, we regret to inform you that your appointment for {service} on {date} at {time} has been rejected. Reason: {reason}. Please contact us to reschedule.`,
            fr: `Bonjour {name}, nous regrettons de vous informer que votre rendez-vous pour {service} le {date} à {time} a été refusé. Raison: {reason}. Veuillez nous contacter pour reprogrammer.`,
            ar: `مرحبا {name}، نأسف لإبلاغك بأنه تم رفض موعدك لـ {service} في {date} الساعة {time}. السبب: {reason}. يرجى الاتصال بنا لإعادة الجدولة.`
        },
        appointmentRescheduled: {
            en: `Hello {name}, your appointment for {service} has been rescheduled to {date} at {time}. Thank you for your understanding.`,
            fr: `Bonjour {name}, votre rendez-vous pour {service} a été reprogrammé pour le {date} à {time}. Merci de votre compréhension.`,
            ar: `مرحبا {name}، تم إعادة جدولة موعدك لـ {service} إلى {date} الساعة {time}. شكرا لتفهمك.`
        }
    };

    let template = messages[messageKey]?.[language] || messages[messageKey]?.en || '';

    // Replace variables in template
    Object.entries(variables).forEach(([key, value]) => {
        if (value) {
            template = template.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
        }
    });

    return template;
}

/**
 * Get email subject line for appointment notifications
 */
export function getLocalizedSubject(
    messageKey: 'appointmentConfirmed' | 'appointmentRejected' | 'appointmentRescheduled',
    language: SupportedLanguage,
    serviceName: string
): string {
    const subjects = {
        appointmentConfirmed: {
            en: `Appointment Confirmed - ${serviceName}`,
            fr: `Rendez-vous Confirmé - ${serviceName}`,
            ar: `تم تأكيد الموعد - ${serviceName}`
        },
        appointmentRejected: {
            en: `Appointment Rejected - ${serviceName}`,
            fr: `Rendez-vous Refusé - ${serviceName}`,
            ar: `تم رفض الموعد - ${serviceName}`
        },
        appointmentRescheduled: {
            en: `Appointment Rescheduled - ${serviceName}`,
            fr: `Rendez-vous Reprogrammé - ${serviceName}`,
            ar: `تم إعادة جدولة الموعد - ${serviceName}`
        }
    };

    return subjects[messageKey]?.[language] || subjects[messageKey]?.en || '';
}
