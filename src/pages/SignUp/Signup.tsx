import React, { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Link } from 'react-router-dom';
import { serverBaseURL } from '../../utils';

const Signup: FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); 
    const navigate = useNavigate(); 

    const [loading, setLoading] = useState(false); 
    const [error, setError] = useState<string | null>(null); 

    const handleSignup = async () => {
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${serverBaseURL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'An unexpected error occurred.');
            }
            console.log(data.token);
            localStorage.setItem('token', data.token);
            navigate('/');
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); 
        handleSignup();
    };

    return (
        <div className="w-full max-w-md bg-white p-8 shadow-lg rounded-md">
            <div className="text-2xl font-bold text-center mb-6 text-primary">Sign Up for SellScaleHood</div>
            <div className="flex justify-center text-black mb-4 mr-5 text-sm">Already have an account?
                <span className='ml-2 text-primary'>
                    <Link className="text-primary hover:text-secondary" to="/login">Login</Link>
                </span>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 mb-1 block" htmlFor="username">
                        Username
                    </label>
                    <input id="username"
                        className="w-full border text-sm border-gray-300 bg-gray-100 text-black rounded px-3 py-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" required
                    />
                </div>

                <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 mb-1 block" htmlFor="email">
                        Email
                    </label>
                    <input id="email"
                        className="w-full border text-sm border-gray-300 bg-gray-100 text-black rounded px-3 py-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" required
                    />
                </div>

                <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 mb-1 block" htmlFor="password">
                        Password
                    </label>
                    <input id="password"
                        className="w-full border text-sm border-gray-300 bg-gray-100 text-black rounded px-3 py-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" required />
                </div>

                <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 mb-1 block" htmlFor="confirmPassword" >
                        Confirm Password
                    </label>
                    <input id="confirmPassword"
                        className="w-full border text-sm border-gray-300 bg-gray-100 text-black rounded px-3 py-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" required />
                </div>

                {error && (
                    <div className="mb-4 text-red-600 text-sm text-center">
                        {error}
                    </div>
                )}

                <button type="submit"
                    className={`w-full bg-primary text-white rounded px-4 py-2 hover:bg-secondary hover:border-none transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={loading}>
                    {loading ? 'Signing up...' : 'Sign Up'}
                </button>
            </form>
        </div>
    );
};

export default Signup;
