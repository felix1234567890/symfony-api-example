// Login page component for React Admin
import { Alert, Box, Button, Card, CardContent, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useLogin, useNotify } from 'react-admin';

const LoginPage = () => {
    const [email, setEmail] = useState('admin@example.com');
    const [password, setPassword] = useState('password123');
    const login = useLogin();
    const notify = useNotify();

    const handleSubmit = e => {
        e.preventDefault();
        login({ username: email, password })
            .catch(() => notify('Invalid email or password'));
    };

    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
            bgcolor="#f0f0f0"
        >
            <Card sx={{ minWidth: 300, maxWidth: 500, boxShadow: 3 }}>
                <CardContent>
                    <Box textAlign="center" mb={2}>
                        <Typography variant="h4" component="h1" gutterBottom>
                            Symfony API Admin
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Sign in to access the admin panel
                        </Typography>
                        <Box mt={2}>
                            <Alert severity="info">
                                Default credentials: admin@example.com / password123
                            </Alert>
                        </Box>
                    </Box>
                    <form onSubmit={handleSubmit}>
                        <Box mb={2}>
                            <TextField
                                label="Email"
                                fullWidth
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                variant="outlined"
                                type="email"
                                required
                            />
                        </Box>
                        <Box mb={2}>
                            <TextField
                                label="Password"
                                fullWidth
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                variant="outlined"
                                type="password"
                                required
                            />
                        </Box>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            size="large"
                        >
                            Login
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
};

export default LoginPage;
