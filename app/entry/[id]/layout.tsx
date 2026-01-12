export default function EntryLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-full w-full flex justify-center overflow-y-auto bg-background">
            <div className="w-full max-w-2xl py-4 px-8">
                {children}
            </div>
        </div>
    )
}