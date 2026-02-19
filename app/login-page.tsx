'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { Bookmark, LogIn } from 'lucide-react'

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
        <main className="flex min-h-screen items-center justify-center p-4"
            style={{ background: 'var(--background)' }}
        >
            <div
                className="w-full max-w-sm rounded-2xl p-8 text-center shadow-xl"
                style={{
                    background: 'var(--card)',
                    border: '1px solid var(--card-border)',
                }}
            >
                {/* App Icon */}
                <div
                    className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
                    style={{ background: 'var(--accent-light)' }}
                >
                    <Bookmark
                        className="h-8 w-8"
                        style={{ color: 'var(--accent)' }}
                    />
                </div>

                {/* Branding */}
                <h1 className="mb-2 text-2xl font-bold">Smart Bookmarks</h1>
                <p className="mb-8 text-sm" style={{ color: 'var(--muted)' }}>
                    Save, organize, and sync your bookmarks across all your devices.
                </p>

                {/* Login Button */}
                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-3 rounded-xl px-6 py-3.5 font-medium text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                    style={{ background: 'var(--accent)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent)'}
                >
                    <LogIn className="h-5 w-5" />
                    {loading ? 'Signing in...' : 'Continue with Google'}
                </button>
            </div>
        </main>
    )
}
