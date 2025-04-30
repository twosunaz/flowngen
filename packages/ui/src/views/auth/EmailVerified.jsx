import { useSearchParams } from 'react-router-dom'
import { Box, Typography, Paper, Button } from '@mui/material'
import { toast } from 'react-toastify'
const EmailVerified = () => {
    const [searchParams] = useSearchParams()
    const status = searchParams.get('status')

    const getMessage = () => {
        switch (status) {
            case 'success':
                return toast.success('✅ Your email has been verified! You may now log in.')
            case 'invalid-token':
                return toast.error('❌ Invalid verification token.')
            case 'not-found':
                return toast.error('❌ Verification token not found or already used.')
            case 'error':
            default:
                return toast.error('🚨 An error occurred during verification. Please try again.')
        }
    }

    return (
        <Box display='flex' justifyContent='center' alignItems='center' height='100vh' bgcolor='white'>
            <Paper elevation={3} sx={{ p: 4, width: 360, textAlign: 'center' }}>
                <Typography variant='h6' gutterBottom>
                    Email Verification
                </Typography>
                <Typography fontSize={14} mb={3}>
                    {getMessage()}
                </Typography>
                <Button variant='contained' color='primary' href='/chatflows'>
                    Go to Login
                </Button>
            </Paper>
        </Box>
    )
}

export default EmailVerified
