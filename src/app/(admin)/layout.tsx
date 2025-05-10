'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function RedirectUser() {
    const router = useRouter();

    useEffect(() => {
        const checkRoleAndRedirect = async () => {
            try {
                const res = await axios.get('/api/auth/me');
                const { rol } = res.data;

                if (rol === 'admin') {
                    router.push('/admin'); // o donde tengas el panel admin
                } else {
                    router.push('/dashboard');
                }
            } catch (error) {
                router.push('/login');
            }
        };

        checkRoleAndRedirect();
    }, [router]);

    return <p className="p-4 text-center">Verificando rol del usuario...</p>;
}
