import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  pool: true,
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || ''),
  auth: {
    user: process.env.SMTP_HOST_USERNAME,
    pass: process.env.SMTP_HOST_PASSWORD
  }
})

export type SendMail = (options: {
  to: string
  subject: string
  html: string
}) => Promise<void>

export const sendMail: SendMail = async ({ to, subject, html }) => {
  return transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html
  })
}
