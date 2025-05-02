// utils/email.ts
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // STARTTLS
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false
    },
    connectionTimeout: 10000, // 10 seconds timeout
    greetingTimeout: 10000,
    socketTimeout: 10000
})

export const sendVerificationEmail = async (email: string, token: string): Promise<void> => {
    const verificationUrl = `${process.env.VERIFICATION_URL}/api/v1/auth/verify-email?token=${token}`

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Verify your FlowNGEN account',
            html: `<p>Welcome to FlowNGEN! Click <a href="${verificationUrl}">here</a> to verify your account.</p>`
        })
        console.log(`[SMTP] Verification email sent to ${email}`)
    } catch (err) {
        console.error('[SMTP ERROR] Failed to send verification email:', err)
        throw new Error('Failed to send verification email')
    }
}

export const sendResetEmail = async (email: string, token: string): Promise<void> => {
    const resetUrl = `${process.env.RESET_PASSWORD_URL}/reset-password?token=${token}`

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Reset your FlowNGEN password',
            html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`
        })
        console.log(`[SMTP] Reset email sent to ${email}`)
    } catch (err) {
        console.error('[SMTP ERROR] Failed to send reset email:', err)
        throw new Error('Failed to send reset email')
    }
}
