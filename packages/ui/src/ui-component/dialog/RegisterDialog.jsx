import { createPortal } from 'react-dom'
import { useRef, useState } from 'react'
import { Dialog, DialogActions, DialogContent, Typography, DialogTitle } from '@mui/material'
import { StyledButton } from '@/ui-component/button/StyledButton'
import { Input } from '@/ui-component/input/Input'
import { toast } from 'react-toastify'
import ReCAPTCHA from 'react-google-recaptcha'

const RegisterDialog = ({ show, onClose }) => {
    const portalElement = document.getElementById('portal')
    const recaptchaRef = useRef(null)

    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [captchaToken, setCaptchaToken] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleRegister = async () => {
        if (!captchaToken) {
            toast.error('🛡️ Please complete the CAPTCHA before registering.')
            return
        }

        setIsSubmitting(true)

        try {
            const response = await fetch('/api/v1/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: username.trim(),
                    email: email.trim(),
                    password,
                    captchaToken
                })
            })

            const data = await response.json()
            if (response.ok) {
                toast.success('✅ Registration successful! You can now log in.')
                onClose()
            } else {
                toast.error('❌ Registration failed: ' + data.message)
                recaptchaRef.current?.reset()
                setCaptchaToken(null)
            }
        } catch (error) {
            toast.error('🚨 Network error: ' + error.message)
            recaptchaRef.current?.reset()
            setCaptchaToken(null)
        } finally {
            setIsSubmitting(false)
        }
    }

    const component = show ? (
        <Dialog open={show} fullWidth maxWidth='xs'>
            <DialogTitle>Register</DialogTitle>
            <DialogContent>
                <Typography>Username</Typography>
                <Input inputParam={{ label: 'Username' }} value={username} onChange={setUsername} />
                <Typography>Email</Typography>
                <Input inputParam={{ label: 'Email', type: 'email' }} value={email} onChange={setEmail} />
                <Typography>Password</Typography>
                <Input inputParam={{ label: 'Password', type: 'password' }} value={password} onChange={setPassword} />
                <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                    <ReCAPTCHA
                        sitekey='6LfqQSsrAAAAAALXBpOZe31WJzzJUNEz_ZVgT5J4'
                        ref={recaptchaRef}
                        onChange={(token) => setCaptchaToken(token)}
                    />
                </div>
            </DialogContent>
            <DialogActions>
                <StyledButton variant='contained' onClick={handleRegister} disabled={isSubmitting}>
                    {isSubmitting ? 'Registering...' : 'Register'}
                </StyledButton>
            </DialogActions>
        </Dialog>
    ) : null

    return createPortal(component, portalElement)
}

export default RegisterDialog
