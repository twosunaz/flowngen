// Template for RegisterDialog.jsx
import { createPortal } from 'react-dom'
import { useState } from 'react'
import { Dialog, DialogActions, DialogContent, Typography, DialogTitle } from '@mui/material'
import { StyledButton } from '@/ui-component/button/StyledButton'
import { Input } from '@/ui-component/input/Input'
import { toast } from 'react-toastify'

const RegisterDialog = ({ show, onClose }) => {
    const portalElement = document.getElementById('portal')
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleRegister = async () => {
        try {
            const response = await fetch('/api/v1/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            })

            const data = await response.json()
            if (response.ok) {
                toast.success('✅ Registration successful! You can now log in.')
                onClose()
            } else {
                toast.error('❌ Registration failed: ' + data.message)
            }
        } catch (error) {
            toast.error('🚨 Network error: ' + error.message)
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
            </DialogContent>
            <DialogActions>
                <StyledButton variant='contained' onClick={handleRegister}>
                    Register
                </StyledButton>
            </DialogActions>
        </Dialog>
    ) : null

    return createPortal(component, portalElement)
}

export default RegisterDialog
