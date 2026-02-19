'use client'

import { useState } from 'react'
import { Bookmark, LogOut } from 'lucide-react'
import BookmarkForm from '@/components/BookmarkForm'
import BookmarkList from '@/components/BookmarkList'

export default function DashboardContent() {
    const [refreshKey, setRefreshKey] = useState(0)

    return (
        <div className="min-h-screen" style={{ background: 'var(--background)' }}>
            {/* Header */}
            <header
                className="sticky top-0 z-10 backdrop-blur-md border-b"
                style={{
                    background: 'color-mix(in srgb, var(--card) 80%, transparent)',
                    borderColor: 'var(--card-border)',
                }}
            >
                <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex h-9 w-9 items-center justify-center rounded-lg"
                            style={{ background: 'var(--accent-light)' }}
                        >
                            <Bookmark className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                        </div>
                        <h1 className="text-xl font-bold">Smart Bookmarks</h1>
                    </div>
                    <form action="/auth/signout" method="post">
                        <button
                            type="submit"
                            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:opacity-80"
                            style={{ color: 'var(--muted)' }}
                        >
                            <LogOut className="h-4 w-4" />
                            Sign out
                        </button>
                    </form>
                </div>
            </header>

            {/* Content */}
            <main className="mx-auto max-w-3xl px-6 py-8">
                <BookmarkForm onBookmarkAdded={() => setRefreshKey((k) => k + 1)} />
                <BookmarkList refreshKey={refreshKey} />
            </main>
        </div>
    )
}
