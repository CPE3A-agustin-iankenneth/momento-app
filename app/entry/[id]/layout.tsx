export default function EntryLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen w-full flex justify-center py-4 px-8">
            <div className="w-full max-w-2xl">
                {children}
            </div>
        </div>
    )
}