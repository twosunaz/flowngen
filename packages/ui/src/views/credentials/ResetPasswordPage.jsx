import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Box, Typography, TextField, Button, Paper } from '@mui/material'
import { toast } from 'react-toastify'

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams()
    const [newPassword, setNewPassword] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const token = searchParams.get('token')
    const [passwordError, setPasswordError] = useState('')

    const validatePassword = (password) => {
        if (password.length < 8) return 'Password must be at least 8 characters'
        if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter'
        if (!/[0-9]/.test(password)) return 'Password must contain a number'
        return ''
    }

    const handleSubmit = async () => {
        setLoading(true)
        setMessage('')

        const error = validatePassword(newPassword)
        if (error) {
            toast.error(`❌ ${error}`)
            setLoading(false)
            return
        }

        try {
            const response = await fetch('/api/v1/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword })
            })

            const data = await response.json()

            if (response.ok) {
                toast.success('✅ Password reset successfully. Redirecting to login...')
                setTimeout(() => {
                    window.location.href = '/chatflows'
                }, 3000)
            } else {
                toast.error('❌ ' + data.message)
            }
        } catch (err) {
            toast.error('🚨 Network error: ' + err.message)
        } finally {
            setLoading(false)
        }
    }
    const handlePasswordChange = (e) => {
        const value = e.target.value
        setNewPassword(value)
        setPasswordError(validatePassword(value))
    }
    return (
        <Box display='flex' justifyContent='center' alignItems='center' height='100vh' bgcolor='white'>
            <Paper elevation={3} sx={{ p: 4, width: 360 }}>
                <Typography variant='h6' mb={2}>
                    Reset Your Password
                </Typography>
                <TextField
                    fullWidth
                    type='password'
                    label='New Password'
                    variant='outlined'
                    value={newPassword}
                    onChange={handlePasswordChange}
                    error={!!passwordError}
                    helperText={passwordError}
                    sx={{ mb: 2 }}
                />
                <Button
                    variant='contained'
                    color='primary'
                    fullWidth
                    onClick={handleSubmit}
                    disabled={loading || !!passwordError || !newPassword}
                >
                    {loading ? 'Sending...' : 'Reset Password'}
                </Button>
                {message && (
                    <Typography mt={2} fontSize={14}>
                        {message}
                    </Typography>
                )}
            </Paper>
        </Box>
    )
}

export default ResetPasswordPage
