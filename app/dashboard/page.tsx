import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BookmarkForm from '@/components/BookmarkForm'
import BookmarkList from '@/components/BookmarkList'

export default async function Dashboard() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/')
    }

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
            <BookmarkForm />
            <BookmarkList />
        </main>
    )
}
