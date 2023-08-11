// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import MailChimp, { MessagesSendResponse } from '@mailchimp/mailchimp_transactional';
import MailGen from 'mailgen';

const API_KEY = process.env.MAILCHIMP_KEY || '[YOUR API KEY HERE]';

const mailgen = new MailGen({
    theme: 'default',
    product: {
        name: 'Covalence',
        link: 'https://covalence.io',
    },
});

const mailchimp = MailChimp(API_KEY);

type Data = {
    success: boolean;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    if (req.method === 'POST') {
        const body = req.body || {};
        const intro = body.intro || '';
        const content = body.content || '';
        const email = {
            body: {
                name: body.name || 'Customer',
                intro,
                outro: content,
            },
        };

        try {
            // Mailchimp send
            const r = await mailchimp.messages.send({
                message: {
                    to: [{
                        email: body.to,
                        name: body.name,
                    }],
                    from_name: 'Covalence',
                    from_email: 'no-reply@covalence.io',
                    subject: body.subject || 'Click bait',
                    text: mailgen.generatePlaintext(email),
                    html: mailgen.generate(email),
                },
            });

            console.log(r);

            if ((<MessagesSendResponse[]>r)?.[0]?.status === 'rejected') {
                throw new Error();
            }

            res.status(200).json({ success: true });
        } catch(e) {
            res.status(500).json({ success: false });
        }

        return;
    }

    res.status(404).json({ success: false });
}
