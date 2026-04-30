import nodemailer from 'nodemailer';
import { getWelcomeEmailTemplate } from './emails/welcomeTemplate';
import { getOrderConfirmationEmailTemplate } from './emails/orderConfirmationTemplate';

let transporter: nodemailer.Transporter | null = null;

const createTransporter = async () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback to local testing with Ethereal if no SMTP is configured in .env
  console.log('No SMTP credentials found in .env, automatically creating an Ethereal test account for local testing...');
  const testAccount = await nodemailer.createTestAccount();
  
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

export const sendWelcomeEmail = async (toEmail: string, name: string) => {
  try {
    if (!transporter) {
      transporter = await createTransporter();
    }

    const html = getWelcomeEmailTemplate({ name });

    const info = await transporter.sendMail({
      from: '"Radhewears" <noreply@radhewears.com>',
      to: toEmail,
      subject: 'Welcome to Radhewears!',
      html,
    });

    console.log('Welcome email sent: %s', info.messageId);
    if (!process.env.SMTP_HOST) {
      console.log('Ethereal Test Mail Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

export const sendOrderConfirmationEmail = async (toEmail: string, orderId: string) => {
  try {
    if (!transporter) {
      transporter = await createTransporter();
    }

    const html = getOrderConfirmationEmailTemplate({ orderId });

    const info = await transporter.sendMail({
      from: '"Radhewears" <noreply@radhewears.com>',
      to: toEmail,
      subject: `Order Confirmation #${orderId} - Radhewears`,
      html,
    });

    console.log('Order confirmation email sent: %s', info.messageId);
    if (!process.env.SMTP_HOST) {
      console.log('Ethereal Test Mail Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return false;
  }
};
