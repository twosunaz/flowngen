// utils/email.ts
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
})

export const sendVerificationEmail = async (email: string, token: string) => {
    const verificationUrl = `${process.env.VERIFICATION_URL}/api/v1/auth/verify-email?token=${token}`
    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Verify your Flowngen account',
        html: `<p>Welcome to Flowngen! Click <a href="${verificationUrl}">here</a> to verify your account.</p>`
    })
}
