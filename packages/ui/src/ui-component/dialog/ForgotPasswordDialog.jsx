// Template for ForgotPasswordDialog.jsx
import { createPortal } from 'react-dom'
import { useState } from 'react'
import { Dialog, DialogActions, DialogContent, Typography, DialogTitle } from '@mui/material'
import { StyledButton } from '@/ui-component/button/StyledButton'
import { Input } from '@/ui-component/input/Input'
import { toast } from 'react-toastify'
const ForgotPasswordDialog = ({ show, onClose }) => {
    const portalElement = document.getElementById('portal')
    const [email, setEmail] = useState('')

    const handleReset = async () => {
        try {
            const response = await fetch('/api/v1/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })

            const data = await response.json()
            if (response.ok) {
                toast.info('📧 Reset email sent!')
                onClose()
            } else {
                toast.error('❌ Failed to send email: ' + data.message)
            }
        } catch (error) {
            toast.error('🚨 Network error: ' + error.message)
        }
    }

    const component = show ? (
        <Dialog open={show} fullWidth maxWidth='xs'>
            <DialogTitle>Forgot Password</DialogTitle>
            <DialogContent>
                <Typography>Email</Typography>
                <Input inputParam={{ label: 'Email', type: 'email' }} value={email} onChange={setEmail} />
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
