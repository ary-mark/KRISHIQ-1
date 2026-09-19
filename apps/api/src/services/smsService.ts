export type SmsRequest = {
    to: string;
    body: string;
};

export type SmsResult = {
    provider: 'twilio' | 'demo';
    messageId: string;
    status: string;
};

export type SmsTemplate = 'booking-confirmed' | 'msp-alert' | 'queue-update';

export type SmsTemplateData = {
    token?: string;
    centreName?: string;
    appointmentTime?: string;
    crop?: string;
    marketPrice?: string;
    mspPrice?: string;
    queuePosition?: number;
};

const MAX_SMS_LENGTH = 480;

const normalizePhoneNumber = (phoneNumber: string) => {
    const normalized = phoneNumber.trim().replace(/[\s()-]/g, '');
    if (!/^\+[1-9]\d{7,14}$/.test(normalized)) {
        throw new Error('SMS recipient must use international format, for example +919876543210');
    }
    return normalized;
};

const isConfigured = () => {
    const requiredValues = [
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_API_KEY,
        process.env.TWILIO_API_SECRET,
        process.env.TWILIO_MESSAGING_SERVICE_SID,
    ];

    return requiredValues.every((value) => value && !value.startsWith('YOUR_'));
};

export const sendSms = async ({ to, body }: SmsRequest): Promise<SmsResult> => {
    const normalizedTo = normalizePhoneNumber(to);
    const trimmedBody = body.trim();
    if (!trimmedBody) {
        throw new Error('SMS recipient and message are required');
    }
    if (trimmedBody.length > MAX_SMS_LENGTH) {
        throw new Error(`SMS message must be ${MAX_SMS_LENGTH} characters or fewer`);
    }

    if (!isConfigured()) {
        const messageId = `demo-sms-${Date.now()}`;
        console.info(`[SMS demo] ${normalizedTo}: ${trimmedBody}`);
        return { provider: 'demo', messageId, status: 'queued' };
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
    const apiKey = process.env.TWILIO_API_KEY as string;
    const apiSecret = process.env.TWILIO_API_SECRET as string;
    const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID as string;
    const form = new URLSearchParams({
        To: normalizedTo,
        Body: trimmedBody,
        MessagingServiceSid: messagingServiceSid,
    });
    const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: form,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Twilio SMS failed (${response.status}): ${errorText}`);
    }

    const message = await response.json() as { sid: string; status: string };
    return { provider: 'twilio', messageId: message.sid, status: message.status };
};

export const sendBookingSms = (phoneNumber: string, token: string, centreName: string, appointmentTime: string) => {
    return sendTemplateSms(phoneNumber, 'booking-confirmed', { token, centreName, appointmentTime });
};

export const sendTemplateSms = (phoneNumber: string, template: SmsTemplate, data: SmsTemplateData) => {
    const messages: Record<SmsTemplate, string> = {
        'booking-confirmed': `KRISHIQ: Slot ${data.token ?? ''} at ${data.centreName ?? 'your procurement centre'} is confirmed for ${data.appointmentTime ?? 'your selected time'}. Arrive 15 minutes early.`,
        'msp-alert': `KRISHIQ: ${data.crop ?? 'Your crop'} is at ${data.marketPrice ?? 'the current market price'} per quintal. MSP reference: ${data.mspPrice ?? 'see app'}. Check before selling.`,
        'queue-update': `KRISHIQ: You are number ${data.queuePosition ?? 'next'} in line at ${data.centreName ?? 'the procurement centre'}. We will notify you when your token is called.`,
    };

    return sendSms({ to: phoneNumber, body: messages[template] });
};
