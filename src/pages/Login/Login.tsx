// Login.tsx

import React, { FC, useState } from 'react';
import { serverBaseURL } from '../../utils';
import { useNavigate } from 'react-router-dom'; // For redirection after login
import { Link } from 'react-router-dom';

const Login: FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate(); // Initialize useNavigate for redirection

    const [loading, setLoading] = useState(false); // State for loading indicator
    const [error, setError] = useState<string | null>(null); // State for error messages

    const handleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${serverBaseURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'An unexpected error occurred.');
            }
            
            localStorage.setItem('token', data.token);
            navigate('/');
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
    
    

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); // Prevent default form submission
        handleLogin();
    };

    return (
        <div className="w-full max-w-md bg-white p-8 shadow-lg rounded-md">
            <div className="text-2xl font-bold text-center mb-6 text-primary">Login to SellScaleHood</div>
            <div className="flex justify-center text-black mb-4 mr-5 text-sm">Dont have an account?
                <span className='ml-2 text-primary'>
                    <Link className="text-primary hover:text-secondary" to="/signup">SignUp</Link>
                </span>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label
                        className="text-sm font-medium text-gray-700 mb-1 block"
                        htmlFor="username"
                    >
                        Username
                    </label>
                    <input
                        id="username"
                        className="w-full border border-gray-300 bg-gray-100 text-black rounded px-3 py-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label
                        className="text-sm font-medium text-gray-700 mb-1 block"
                        htmlFor="password"
                    >
                        Password
                    </label>
                    <input
                        id="password"
                        className="w-full border border-gray-300 bg-gray-100 text-black rounded px-3 py-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                    />
                </div>

                {error && (
                    <div className="mb-4 text-red-600 text-sm text-center">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className={`w-full bg-primary text-white rounded px-4 py-2 hover:bg-secondary hover:border-none transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    disabled={loading}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
};

export default Login;
