const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const handlebars = require('handlebars');

const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const readHbsFile = (templateName, data) => {
  try {
    const filePath = path.join(__dirname, '../../', 'views', `${templateName}.hbs`);
    const templateSource = fs.readFileSync(filePath, 'utf8');
    const template = handlebars.compile(templateSource);
    return template(data);
  } catch (error) {
    console.error('Error reading HBS file:', error);
    return null;
  }
};

const sendEmail = async (to, subject, template, context,attachment) => {
  const html = readHbsFile(template, context);
  try {
    const mailOptions = {
      from: '"Demo Sender" <noreply@demomailtrap.com>',
      to,
      subject,
      html,
      attachments: attachment,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = sendEmail;
