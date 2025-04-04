const handleLogin = async (username, password) => {
    try {
        const res = await fetch('/docker/create-container', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })

        const data = await res.json()
        if (res.ok) {
            console.log('Container created:', data)
            // handle successful login + container creation
        } else {
            console.error('Login failed:', data.message)
        }
    } catch (error) {
        console.error('API error:', error)
    }
}

export {handleLogin}