// utils/email.ts
import nodemailer from 'nodemailer'
import { MailtrapTransport } from 'mailtrap'

const transporter = nodemailer.createTransport(
    MailtrapTransport({
        token: process.env.MAILTRAP_API_TOKEN || ''
    })
)

const FROM = `FlowNGEN <${process.env.EMAIL_FROM || 'no-reply@flowngen.com'}>`

export const sendVerificationEmail = async (email: string, token: string): Promise<void> => {
    const verificationUrl = `${process.env.VERIFICATION_URL}/api/v1/auth/verify-email?token=${token}`

    try {
        await transporter.sendMail({
            from: FROM,
            to: [email],
            subject: 'Verify your FlowNGEN account',
            html: `<p>Welcome to FlowNGEN! Click <a href="${verificationUrl}">here</a> to verify your account.</p>`,
            category: 'User Onboarding'
        })

        console.log(`[Mailtrap API] Verification email sent to ${email}`)
    } catch (err) {
        console.error('[Mailtrap API] Error sending verification email:', err)
        throw err
    }
}

export const sendResetEmail = async (email: string, token: string): Promise<void> => {
    const resetUrl = `${process.env.RESET_PASSWORD_URL}/reset-password?token=${token}`

    try {
        await transporter.sendMail({
            from: FROM,
            to: [email],
            subject: 'Reset your FlowNGEN password',
            html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
            category: 'Password Reset'
        })

        console.log(`[Mailtrap API] Reset email sent to ${email}`)
    } catch (err) {
        console.error('[Mailtrap API] Error sending reset email:', err)
        throw err
    }
}
