import nodemailer from 'nodemailer';

export const makeTransport = async () => {
  
  // If EMAIL_USER and EMAIL_PASS provided -> use those creds (e.g., SMTP)
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_HOST) {
    const transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true', // true for 465
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
    return { transport, isEthereal: false };
  }

  // Otherwise create Ethereal test account automatically (dev)
  const testAccount = await nodemailer.createTestAccount();
  const transport = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass }
  });
  return { transport, isEthereal: true, testAccount };
};

export const sendEmail = async ({ to, subject, html }) => {
  const { transport, isEthereal } = await makeTransport();
  const info = await transport.sendMail({
    from: process.env.EMAIL_FROM || 'Auth App <no-reply@authapp.dev>',
    to,
    subject,
    html
  });

  if (isEthereal) {
    console.log('📧 Ethereal preview URL:', nodemailer.getTestMessageUrl(info));
  }
  return info;
};
