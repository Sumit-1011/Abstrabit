'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function LoginPage() {
    const supabase = createClient()
    const [loading, setLoading] = useState(false)

    const handleLogin = async () => {
        setLoading(true)

        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        })

        setLoading(false)
    }

    return (
        <main className="flex min-h-screen items-center justify-center">
            <button
                onClick={handleLogin}
                className="px-6 py-3 bg-black text-white rounded-lg"
            >
                {loading ? 'Loading...' : 'Login with Google'}
            </button>
        </main>
    )
}
