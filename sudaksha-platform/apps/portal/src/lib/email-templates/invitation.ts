export const invitationEmailTemplate = (companyName: string, inviteLink: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; }
        .header { text-align: center; margin-bottom: 30px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; }
        .footer { margin-top: 30px; font-size: 12px; color: #999; text-align: center; }
    </style>
</head>
<body>
    <div className="container">
        <div className="header">
            <h1 style="color: #4f46e5; margin: 0;">SudAssess</h1>
        </div>
        <h2>You've been invited!</h2>
        <p>Hi there,</p>
        <p>You have been invited to join <strong>${companyName}</strong> on SudAssess, the AI-powered skill assessment platform.</p>
        <p>To accept your invitation and set up your account, please click the button below:</p>
        <p style="text-align: center;">
            <a href="${inviteLink}" class="button">Accept Invitation</a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666; font-size: 14px;">${inviteLink}</p>
        <p>This invitation link will expire in 7 days.</p>
        <div className="footer">
            <p>&copy; ${new Date().getFullYear()} SudAssess. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;
