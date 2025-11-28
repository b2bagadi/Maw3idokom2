export const notificationMessages = {
    en: {
        confirmation: {
            subject: "Appointment Confirmed ✅",
            greeting: "Dear {customerName},",
            body: "Great news! Your appointment has been confirmed.",
            details: `
📅 Date: {date}
⏰ Time: {time}
✂️ Service: {serviceName}
🏪 Business: {businessName}
💰 Price: {price} MAD
⏱️ Duration: {duration} minutes`,
            footer: "We look forward to seeing you!",
            whatsappBody: `✅ *APPOINTMENT CONFIRMED*\n\nDear {customerName},\n\nYour appointment has been confirmed!\n\n📅 Date: {date}\n⏰ Time: {time}\n✂️ Service: {serviceName}\n🏪 Business: {businessName}\n💰 Price: {price} MAD\n\nWe look forward to seeing you!`
        },
        cancellation: {
            subject: "Appointment Cancelled ❌",
            greeting: "Dear {customerName},",
            body: "We regret to inform you that your appointment has been cancelled.",
            details: `
📅 Original Date: {date}
⏰ Original Time: {time}
✂️ Service: {serviceName}
🏪 Business: {businessName}`,
            reason: "❌ Reason: {reason}",
            footer: "We sincerely apologize for any inconvenience this may cause.",
            whatsappBody: `❌ *APPOINTMENT CANCELLED*\n\nDear {customerName},\n\nYour appointment has been cancelled.\n\n📅 Date: {date}\n⏰ Time: {time}\n✂️ Service: {serviceName}\n🏪 Business: {businessName}\n\n❌ Reason: {reason}\n\nWe apologize for any inconvenience.`
        },
        reschedule: {
            subject: "Appointment Rescheduled 🔄",
            greeting: "Dear {customerName},",
            body: "Your appointment has been rescheduled to a new date and time.",
            oldDetails: `
📅 Original Date: {oldDate}
⏰ Original Time: {oldTime}`,
            newDetails: `
📅 New Date: {newDate}
⏰ New Time: {newTime}`,
            serviceDetails: `
✂️ Service: {serviceName}
🏪 Business: {businessName}
💰 Price: {price} MAD`,
            reason: "🔄 Reason: {reason}",
            footer: "We apologize for any inconvenience and look forward to seeing you!",
            whatsappBody: `🔄 *APPOINTMENT RESCHEDULED*\n\nDear {customerName},\n\nYour appointment has been rescheduled.\n\n❌ Original:\n📅 {oldDate}\n⏰ {oldTime}\n\n✅ New:\n📅 {newDate}\n⏰ {newTime}\n\n✂️ Service: {serviceName}\n🏪 Business: {businessName}\n\n🔄 Reason: {reason}\n\nWe look forward to seeing you!`
        }
    },
    fr: {
        confirmation: {
            subject: "Rendez-vous confirmé ✅",
            greeting: "Cher/Chère {customerName},",
            body: "Bonne nouvelle ! Votre rendez-vous a été confirmé.",
            details: `
📅 Date: {date}
⏰ Heure: {time}
✂️ Service: {serviceName}
🏪 Établissement: {businessName}
💰 Prix: {price} MAD
⏱️ Durée: {duration} minutes`,
            footer: "Nous sommes impatients de vous voir !",
            whatsappBody: `✅ *RENDEZ-VOUS CONFIRMÉ*\n\nCher/Chère {customerName},\n\nVotre rendez-vous a été confirmé !\n\n📅 Date: {date}\n⏰ Heure: {time}\n✂️ Service: {serviceName}\n🏪 Établissement: {businessName}\n💰 Prix: {price} MAD\n\nNous sommes impatients de vous voir !`
        },
        cancellation: {
            subject: "Rendez-vous annulé ❌",
            greeting: "Cher/Chère {customerName},",
            body: "Nous regrettons de vous informer que votre rendez-vous a été annulé.",
            details: `
📅 Date originale: {date}
⏰ Heure originale: {time}
✂️ Service: {serviceName}
🏪 Établissement: {businessName}`,
            reason: "❌ Raison: {reason}",
            footer: "Nous nous excusons sincèrement pour tout désagrément.",
            whatsappBody: `❌ *RENDEZ-VOUS ANNULÉ*\n\nCher/Chère {customerName},\n\nVotre rendez-vous a été annulé.\n\n📅 Date: {date}\n⏰ Heure: {time}\n✂️ Service: {serviceName}\n🏪 Établissement: {businessName}\n\n❌ Raison: {reason}\n\nNous nous excusons pour le désagrément.`
        },
        reschedule: {
            subject: "Rendez-vous reporté 🔄",
            greeting: "Cher/Chère {customerName},",
            body: "Votre rendez-vous a été reporté à une nouvelle date et heure.",
            oldDetails: `
📅 Date originale: {oldDate}
⏰ Heure originale: {oldTime}`,
            newDetails: `
📅 Nouvelle date: {newDate}
⏰ Nouvelle heure: {newTime}`,
            serviceDetails: `
✂️ Service: {serviceName}
🏪 Établissement: {businessName}
💰 Prix: {price} MAD`,
            reason: "🔄 Raison: {reason}",
            footer: "Nous nous excusons pour le désagrément et sommes impatients de vous voir !",
            whatsappBody: `🔄 *RENDEZ-VOUS REPORTÉ*\n\nCher/Chère {customerName},\n\nVotre rendez-vous a été reporté.\n\n❌ Original:\n📅 {oldDate}\n⏰ {oldTime}\n\n✅ Nouveau:\n📅 {newDate}\n⏰ {newTime}\n\n✂️ Service: {serviceName}\n🏪 Établissement: {businessName}\n\n🔄 Raison: {reason}\n\nÀ bientôt !`
        }
    },
    ar: {
        confirmation: {
            subject: "تم تأكيد الموعد ✅",
            greeting: "عزيزي/عزيزتي {customerName}،",
            body: "أخبار سارة! تم تأكيد موعدك.",
            details: `
📅 التاريخ: {date}
⏰ الوقت: {time}
✂️ الخدمة: {serviceName}
🏪 المحل: {businessName}
💰 السعر: {price} درهم
⏱️ المدة: {duration} دقيقة`,
            footer: "نتطلع لرؤيتك!",
            whatsappBody: `✅ *تم تأكيد الموعد*\n\nعزيزي/عزيزتي {customerName}،\n\nتم تأكيد موعدك!\n\n📅 التاريخ: {date}\n⏰ الوقت: {time}\n✂️ الخدمة: {serviceName}\n🏪 المحل: {businessName}\n💰 السعر: {price} درهم\n\nنتطلع لرؤيتك!`
        },
        cancellation: {
            subject: "تم إلغاء الموعد ❌",
            greeting: "عزيزي/عزيزتي {customerName}،",
            body: "يؤسفنا إبلاغك بأنه تم إلغاء موعدك.",
            details: `
📅 التاريخ الأصلي: {date}
⏰ الوقت الأصلي: {time}
✂️ الخدمة: {serviceName}
🏪 المحل: {businessName}`,
            reason: "❌ السبب: {reason}",
            footer: "نعتذر بشدة عن أي إزعاج قد يحدث.",
            whatsappBody: `❌ *تم إلغاء الموعد*\n\nعزيزي/عزيزتي {customerName}،\n\nتم إلغاء موعدك.\n\n📅 التاريخ: {date}\n⏰ الوقت: {time}\n✂️ الخدمة: {serviceName}\n🏪 المحل: {businessName}\n\n❌ السبب: {reason}\n\nنعتذر عن الإزعاج.`
        },
        reschedule: {
            subject: "تم تأجيل الموعد 🔄",
            greeting: "عزيزي/عزيزتي {customerName}،",
            body: "تم تأجيل موعدك إلى تاريخ ووقت جديدين.",
            oldDetails: `
📅 التاريخ الأصلي: {oldDate}
⏰ الوقت الأصلي: {oldTime}`,
            newDetails: `
📅 التاريخ الجديد: {newDate}
⏰ الوقت الجديد: {newTime}`,
            serviceDetails: `
✂️ الخدمة: {serviceName}
🏪 المحل: {businessName}
💰 السعر: {price} درهم`,
            reason: "🔄 السبب: {reason}",
            footer: "نعتذر عن أي إزعاج ونتطلع لرؤيتك!",
            whatsappBody: `🔄 *تم تأجيل الموعد*\n\nعزيزي/عزيزتي {customerName}،\n\nتم تأجيل موعدك.\n\n❌ الأصلي:\n📅 {oldDate}\n⏰ {oldTime}\n\n✅ الجديد:\n📅 {newDate}\n⏰ {newTime}\n\n✂️ الخدمة: {serviceName}\n🏪 المحل: {businessName}\n\n🔄 السبب: {reason}\n\nإلى اللقاء!`
        }
    }
};

export type Language = 'en' | 'fr' | 'ar';
export type NotificationType = 'confirmation' | 'cancellation' | 'reschedule';

export function getMessage(language: Language, type: NotificationType) {
    return notificationMessages[language]?.[type] || notificationMessages.en[type];
}
