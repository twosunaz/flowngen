import { createPortal } from 'react-dom'
import { useState } from 'react'
import PropTypes from 'prop-types'

import { Dialog, DialogActions, DialogContent, Typography, DialogTitle } from '@mui/material'
import { StyledButton } from '@/ui-component/button/StyledButton'
import { Input } from '@/ui-component/input/Input'

const LoginDialog = ({ show, dialogProps, onConfirm }) => {
    const portalElement = document.getElementById('portal')
    const usernameInput = {
        label: 'Username',
        name: 'username',
        type: 'string',
        placeholder: 'Marcos Duarte'
    }
    const passwordInput = {
        label: 'Password',
        name: 'password',
        type: 'password'
    }
    const [usernameVal, setUsernameVal] = useState('')
    const [passwordVal, setPasswordVal] = useState('')
    console.log('initializing login')
    const handleLogin = async () => {
        try {
            const response = await fetch('/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: usernameVal, password: passwordVal })
            })

            const data = await response.json()
            console.log('firing login auth')
            if (response.ok) {
                console.log('✅ Login successful:', data)
                onConfirm(usernameVal, passwordVal) // Optional: trigger success callback
            } else {
                console.error('❌ Login failed:', data.message)
                // Optional: Show error message on UI
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
                <div style={{ marginTop: 20 }}></div>
                <Typography>Password</Typography>
                <Input inputParam={passwordInput} onChange={(newValue) => setPasswordVal(newValue)} value={passwordVal} />
            </DialogContent>
            <DialogActions>
                <StyledButton variant='contained' onClick={handleLogin}>
                    {dialogProps.confirmButtonName}
                </StyledButton>
            </DialogActions>
        </Dialog>
    ) : null

    return createPortal(component, portalElement)
}

LoginDialog.propTypes = {
    show: PropTypes.bool,
    dialogProps: PropTypes.object,
    onConfirm: PropTypes.func
}

export default LoginDialog
