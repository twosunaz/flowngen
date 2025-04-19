import { createPortal } from 'react-dom'
import { useState } from 'react'
import PropTypes from 'prop-types'

import { Dialog, DialogActions, DialogContent, Typography, DialogTitle, Link, Box } from '@mui/material'
import { StyledButton } from '@/ui-component/button/StyledButton'
import { Input } from '@/ui-component/input/Input'

import RegisterDialog from './RegisterDialog'
import ForgotPasswordDialog from './ForgotPasswordDialog'

const LoginDialog = ({ show, dialogProps, onConfirm }) => {
    const portalElement = document.getElementById('portal')

    const usernameInput = {
        label: 'Username',
        name: 'username',
        type: 'string',
        placeholder: 'John Doe'
    }
    const passwordInput = {
        label: 'Password',
        name: 'password',
        type: 'password'
    }

    const [usernameVal, setUsernameVal] = useState('')
    const [passwordVal, setPasswordVal] = useState('')
    const [showRegister, setShowRegister] = useState(false)
    const [showForgotPassword, setShowForgotPassword] = useState(false)

    const handleLogin = async () => {
        try {
            const response = await fetch('/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: usernameVal, password: passwordVal })
            })

            const data = await response.json()

            if (response.ok) {
                localStorage.setItem('token', data.token)
                localStorage.setItem('user', JSON.stringify(data.user))
                onConfirm(usernameVal, passwordVal)
            } else {
                console.error('❌ Login failed:', data.message)
            }
        } catch (error) {
            console.error('🚨 Network error:', error)
        }
    }

    const component = show ? (
        <Dialog
            onKeyUp={(e) => {
                if (e.key === 'Enter') {
                    handleLogin()
                }
            }}
            open={show}
            fullWidth
            maxWidth='xs'
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
        >
            <DialogTitle sx={{ fontSize: '1rem' }} id='alert-dialog-title'>
                {dialogProps.title}
            </DialogTitle>
            <DialogContent>
                <Typography>Username</Typography>
                <Input
                    inputParam={usernameInput}
                    onChange={(newValue) => setUsernameVal(newValue)}
                    value={usernameVal}
                    showDialog={false}
                />
                <Box mt={2}>
                    <Typography>Password</Typography>
                    <Input inputParam={passwordInput} onChange={(newValue) => setPasswordVal(newValue)} value={passwordVal} />
                </Box>
                <Box mt={2} display='flex' justifyContent='space-between'>
                    <Link component='button' variant='body2' onClick={() => setShowRegister(true)} underline='hover'>
                        Register
                    </Link>
                    <Link component='button' variant='body2' onClick={() => setShowForgotPassword(true)} underline='hover'>
                        Forgot Password?
                    </Link>
                </Box>
            </DialogContent>
            <DialogActions>
                <StyledButton variant='contained' onClick={handleLogin}>
                    {dialogProps.confirmButtonName}
                </StyledButton>
            </DialogActions>
        </Dialog>
    ) : null

    return (
        <>
            {createPortal(component, portalElement)}
            <RegisterDialog show={showRegister} onClose={() => setShowRegister(false)} />
            <ForgotPasswordDialog show={showForgotPassword} onClose={() => setShowForgotPassword(false)} />
        </>
    )
}

LoginDialog.propTypes = {
    show: PropTypes.bool,
    dialogProps: PropTypes.object,
    onConfirm: PropTypes.func
}

export default LoginDialog
