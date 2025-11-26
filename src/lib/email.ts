import { getMessage, Language } from '@/lib/i18n/notification-messages';

interface EmailData {
    to: string;
    subject: string;
    htmlContent: string;
}

/**
 * Replace placeholders in template
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
 * Generate HTML email template
 */
function generateEmailHTML(content: string, isRTL: boolean = false): string {
    return `
<!DOCTYPE html>
<html ${isRTL ? 'dir="rtl"' : ''}>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: ${isRTL ? 'Arial, sans-serif' : 'Inter, Arial, sans-serif'};
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #f0f0f0;
    }
    .content {
      white-space: pre-line;
      font-size: 16px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #f0f0f0;
      color: #666;
      font-size: 14px;
    }
    .details {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border-${isRTL ? 'right' : 'left'}: 4px solid #4CAF50;
    }
    .reason {
      background-color: #fff3cd;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
      border-${isRTL ? 'right' : 'left'}: 4px solid #ffc107;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="color: #2c3e50; margin: 0;">Maw3idokom</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>This is an automated message from Maw3idokom</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Send confirmation email
 */
export async function sendConfirmationEmail(
    to: string,
    data: {
        customerName: string;
        businessName: string;
        serviceName: string;
        date: string;
        time: string;
        price: number;
        duration: number;
    },
    language: Language = 'en'
): Promise<{ success: boolean; message?: string }> {
    const messages = getMessage(language, 'confirmation');
    const isRTL = language === 'ar';

    const content = `
    <p>${replacePlaceholders(messages.greeting, data)}</p>
    <p><strong>${messages.body}</strong></p>
    <div class="details">
      ${replacePlaceholders(messages.details, data)}
    </div>
    <p>${messages.footer}</p>
  `;

    const htmlContent = generateEmailHTML(content, isRTL);

    // For now, return success with WhatsApp fallback message
    // In production, integrate with Resend or another email service
    console.log(`[EMAIL] Would send to: ${to}`);
    console.log(`[EMAIL] Subject: ${messages.subject}`);
    console.log(`[EMAIL] Language: ${language}`);

    return {
        success: true,
        message: 'Email notification prepared (Email service not yet configured)'
    };
}

/**
 * Send cancellation email
 */
export async function sendCancellationEmail(
    to: string,
    data: {
        customerName: string;
        businessName: string;
        serviceName: string;
        date: string;
        time: string;
        price: number;
        duration: number;
        reason: string;
    },
    language: Language = 'en'
): Promise<{ success: boolean; message?: string }> {
    const messages = getMessage(language, 'cancellation');
    const isRTL = language === 'ar';

    const content = `
    <p>${replacePlaceholders(messages.greeting, data)}</p>
    <p>${messages.body}</p>
    <div class="details">
      ${replacePlaceholders(messages.details, data)}
    </div>
    <div class="reason">
      ${replacePlaceholders(messages.reason, data)}
    </div>
    <p>${messages.footer}</p>
  `;

    const htmlContent = generateEmailHTML(content, isRTL);

    console.log(`[EMAIL] Would send to: ${to}`);
    console.log(`[EMAIL] Subject: ${messages.subject}`);
    console.log(`[EMAIL] Language: ${language}`);

    return {
        success: true,
        message: 'Email notification prepared (Email service not yet configured)'
    };
}

/**
 * Send reschedule email
 */
export async function sendRescheduleEmail(
    to: string,
    data: {
        customerName: string;
        businessName: string;
        serviceName: string;
        oldDate: string;
        oldTime: string;
        newDate: string;
        newTime: string;
        price: number;
        duration: number;
        reason: string;
    },
    language: Language = 'en'
): Promise<{ success: boolean; message?: string }> {
    const messages = getMessage(language, 'reschedule');
    const isRTL = language === 'ar';

    const content = `
    <p>${replacePlaceholders(messages.greeting, data)}</p>
    <p>${messages.body}</p>
    <div class="details">
      ${replacePlaceholders(messages.oldDetails, data)}
    </div>
    <div class="details" style="border-left-color: #2196F3;">
      ${replacePlaceholders(messages.newDetails, data)}
    </div>
    <div class="details" style="border-left-color: #9C27B0;">
      ${replacePlaceholders(messages.serviceDetails, data)}
    </div>
    <div class="reason">
      ${replacePlaceholders(messages.reason, data)}
    </div>
    <p>${messages.footer}</p>
  `;

    const htmlContent = generateEmailHTML(content, isRTL);

    console.log(`[EMAIL] Would send to: ${to}`);
    console.log(`[EMAIL] Subject: ${messages.subject}`);
    console.log(`[EMAIL] Language: ${language}`);

    return {
        success: true,
        message: 'Email notification prepared (Email service not yet configured)'
    };
}
