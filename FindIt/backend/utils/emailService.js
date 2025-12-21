import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const sendActualEmail = async (to, subject, text, html) => {
    if (process.env.EMAIL_ENABLED !== 'true') {
        console.log('Email sending disabled. Would send:', { to, subject });
        return { success: true, message: 'Email disabled' };
    }

    try {
        if (!process.env.SENDGRID_API_KEY) {
            throw new Error('SendGrid API key is not configured');
        }

        if (!process.env.SENDGRID_FROM_EMAIL) {
            throw new Error('SendGrid FROM email is not configured');
        }

        const msg = {
            to: to,
            from: {
                email: process.env.SENDGRID_FROM_EMAIL,
                name: process.env.SENDGRID_FROM_NAME || 'FindIt'
            },
            subject: subject,
            text: text,
            html: html || text.replace(/\n/g, '<br>')
        };

        const response = await sgMail.send(msg);
        console.log('Email sent successfully via SendGrid:', {
            statusCode: response[0].statusCode,
            to: to,
            subject: subject
        });

        return { success: true, messageId: response[0].headers['x-message-id'] };
    } catch (error) {
        console.error('Email send error:', error.message);
        if (error.response) {
            console.error('SendGrid error details:', error.response.body);
        }
        return { success: false, error: error.message };
    }
};

const sendMatchNotification = async (recipient, sender, item) => {
    console.log('Match notification:', {
        event: 'match_notification',
        recipient: recipient?.email,
        sender: sender?.email,
        item: {
            name: item?.name,
            category: item?.category,
            status: item?.status
        }
    });

    const subject = `New Match Found for Your ${item.category} Item: ${item.name}`;
    const text = `Hi ${recipient.name},\n\nGreat news! We found a potential match for your ${item.category.toLowerCase()} item "${item.name}".\n\nMatch Details:\n- Posted by: ${sender.name}\n- Location: ${item.location}\n\nPlease log in to your FindIt account to review this match and contact the person.\n\nBest regards,\nFindIt Team`;

    return sendActualEmail(recipient.email, subject, text);
};

const sendClaimNotification = async (itemOwner, claimant, item, message, isClaimingMatch = false) => {
    const emailSubject = isClaimingMatch
        ? `Someone claimed a match for your ${item.category.toLowerCase()} item: ${item.name}`
        : `New response on your ${item.category.toLowerCase()} item: ${item.name}`;

    const emailBody = `Hi ${itemOwner.name},

${claimant.name} has ${isClaimingMatch ? 'claimed a match' : 'responded'} to your ${item.category.toLowerCase()} item "${item.name}".

Message: "${message}"

Item Location: ${item.location}

Claimant Details:
- Name: ${claimant.name}
- Email: ${claimant.email}

Please log in to your FindIt account to view and manage this ${isClaimingMatch ? 'claim' : 'response'}.

Best regards,
FindIt Team`;

    const result = await sendActualEmail(itemOwner.email, emailSubject, emailBody);

    return result;
};

export { sendMatchNotification, sendClaimNotification };
