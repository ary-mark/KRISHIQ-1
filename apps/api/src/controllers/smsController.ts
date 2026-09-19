import { Request, Response } from 'express';
import { sendSms, sendTemplateSms, SmsTemplate } from '../services/smsService';

const supportedTemplates: SmsTemplate[] = ['booking-confirmed', 'msp-alert', 'queue-update'];

export const sendSmsNotification = async (req: Request, res: Response) => {
    const { to, body, template, data } = req.body as {
        to?: string;
        body?: string;
        template?: SmsTemplate;
        data?: Record<string, string | number>;
    };

    if (!to || (!body && !template)) {
        return res.status(400).json({ error: 'to and either body or template are required' });
    }
    if (template && !supportedTemplates.includes(template)) {
        return res.status(400).json({ error: `template must be one of: ${supportedTemplates.join(', ')}` });
    }

    const result = template
        ? await sendTemplateSms(to, template, data ?? {})
        : await sendSms({ to, body: body as string });
    return res.status(202).json(result);
};
