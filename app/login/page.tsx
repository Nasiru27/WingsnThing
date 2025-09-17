'use client';
import React, { useState, useEffect, Suspense } from 'react'; // 1. Import Suspense
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';

// 2. This export tells Next.js to always render this page dynamically.
export const dynamic = 'force-dynamic';

// We create a child component that contains the dynamic logic.
const LoginForm = () => {
    const { login, authStatus } = useAppContext();
    const router = useRouter();
    const searchParams = useSearchParams(); // This hook is now safely inside the Suspense boundary.

    const [role, setRole] = useState<'admin' | 'waiter'>('waiter');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const isAdminLogin = searchParams.get('role') === 'admin';
    
    useEffect(() => {
        if (authStatus.isAuthenticated) {
            const destination = authStatus.role === 'admin' ? '/admin' : '/waiter';
            router.push(destination);
        }
    }, [authStatus, router]);

    useEffect(() => {
        const roleFromQuery = searchParams.get('role');
        if (roleFromQuery === 'admin' || roleFromQuery === 'waiter') {
            setRole(roleFromQuery);
        } else {
            setRole('waiter');
        }
    }, [searchParams]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;
        setError('');
        setIsLoading(true);
        try {
            const success = await login(role, password);
            if (!success) {
                setError('Incorrect password. Please try again.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (authStatus.isAuthenticated === null) {
        return <div className="flex items-center justify-center min-h-screen"><p>Loading...</p></div>;
    }

    return (
        <div className="flex items-center justify-center min-h-[80vh] bg-slate-100">
            <div className="p-8 bg-white rounded-lg shadow-xl w-full max-w-sm m-4">
                
                {isAdminLogin && (
                    <div className="flex justify-center mb-6">
                        <button 
                            onClick={() => setRole('waiter')}
                            disabled={isLoading}
                            className={`px-6 py-2 w-1/2 text-center font-semibold rounded-l-lg transition-colors ${role === 'waiter' ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            Waiter
                        </button>
                        <button 
                            onClick={() => setRole('admin')}
                            disabled={isLoading}
                            className={`px-6 py-2 w-1/2 text-center font-semibold rounded-r-lg transition-colors ${role === 'admin' ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            Admin
                        </button>
                    </div>
                )}

                <h1 className="text-2xl font-bold mb-6 text-center text-brand-dark capitalize">{role} Login</h1>
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    <button 
                        type="submit" 
                        disabled={isLoading || !password}
                        className="w-full bg-brand-primary text-white font-bold py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// The main page component now wraps our dynamic form in a Suspense boundary.
const LoginPage = () => {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p>Loading page...</p></div>}>
            <LoginForm />
        </Suspense>
    );
};

export default LoginPage;