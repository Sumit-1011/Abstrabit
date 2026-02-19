'use client'

import { useState } from 'react'
import BookmarkForm from '@/components/BookmarkForm'
import BookmarkList from '@/components/BookmarkList'

export default function DashboardContent() {
    const [refreshKey, setRefreshKey] = useState(0)

    return (
        <main className="max-w-3xl mx-auto p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">My Bookmarks</h1>
                <form action="/auth/signout" method="post">
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm text-zinc-600 hover:text-black"
                    >
                        Sign out
                    </button>
                </form>
            </div>
            <BookmarkForm onBookmarkAdded={() => setRefreshKey((k) => k + 1)} />
            <BookmarkList refreshKey={refreshKey} />
        </main>
    )
}
