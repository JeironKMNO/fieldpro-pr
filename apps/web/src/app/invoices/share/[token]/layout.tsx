export default function InvoiceShareLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
                {children}
            </div>
            <footer className="pb-6 text-center text-xs text-gray-400">
                Powered by FieldPro
            </footer>
        </div>
    );
}
