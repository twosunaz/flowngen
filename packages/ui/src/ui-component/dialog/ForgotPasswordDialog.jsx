import { createPortal } from 'react-dom'
import { useRef, useState } from 'react'
import { Dialog, DialogActions, DialogContent, Typography, DialogTitle } from '@mui/material'
import { StyledButton } from '@/ui-component/button/StyledButton'
import { Input } from '@/ui-component/input/Input'
import { toast } from 'react-toastify'
import ReCAPTCHA from 'react-google-recaptcha'

const ForgotPasswordDialog = ({ show, onClose }) => {
    const portalElement = document.getElementById('portal')
    const recaptchaRef = useRef(null)

    const [email, setEmail] = useState('')
    const [captchaToken, setCaptchaToken] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleReset = async () => {
        if (!captchaToken) {
            toast.error("🛡️ Please verify you're not a robot.")
            return
        }

        setLoading(true)

        try {
            const response = await fetch('/api/v1/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), captchaToken })
            })

            const data = await response.json()
            if (response.ok) {
                toast.info('📧 Reset email sent!')
                onClose()
            } else {
                toast.error('❌ Failed to send email: ' + data.message)
                recaptchaRef.current?.reset()
                setCaptchaToken(null)
            }
        } catch (error) {
            toast.error('🚨 Network error: ' + error.message)
            recaptchaRef.current?.reset()
            setCaptchaToken(null)
        } finally {
            setLoading(false)
        }
    }

    const component = show ? (
        <Dialog open={show} fullWidth maxWidth='xs'>
            <DialogTitle>Forgot Password</DialogTitle>
            <DialogContent>
                <Typography>Email</Typography>
                <Input inputParam={{ label: 'Email', type: 'email' }} value={email} onChange={setEmail} />
                <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                    <ReCAPTCHA
                        sitekey='6LfqQSsrAAAAAALXBpOZe31WJzzJUNEz_ZVgT5J4' // Your public site key
                        ref={recaptchaRef}
                        onChange={(token) => setCaptchaToken(token)}
                    />
                </div>
            </DialogContent>
            <DialogActions>
                <StyledButton variant='contained' onClick={handleReset} disabled={loading}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
                </StyledButton>
            </DialogActions>
        </Dialog>
    ) : null

    return createPortal(component, portalElement)
}

export default ForgotPasswordDialog
