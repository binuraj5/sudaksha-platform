export async function sendEmail(to: string, subject: string, html: string) {
    console.log("--------------------EMAIL--------------------");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`HTML: ${html}`);
    console.log("---------------------------------------------");

    // In a real application, you would use Resend, SendGrid, AWS SES, etc.
    return Promise.resolve(true);
}
