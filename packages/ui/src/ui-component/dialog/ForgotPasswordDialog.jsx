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

    const handleReset = async () => {
        if (!captchaToken) {
            toast.error("🛡️ Please verify you're not a robot.")
            return
        }

        try {
            const response = await fetch('/api/v1/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, captchaToken })
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
                        sitekey='6LcFMisrAAAAAE2AbwVrFT_5eV5Y8I-pAKeNNd7y' // Your public site key
                        ref={recaptchaRef}
                        onChange={(token) => setCaptchaToken(token)}
                    />
                </div>
            </DialogContent>
            <DialogActions>
                <StyledButton variant='contained' onClick={handleReset}>
                    Send Reset Link
                </StyledButton>
            </DialogActions>
        </Dialog>
    ) : null

    return createPortal(component, portalElement)
}

export default ForgotPasswordDialog
