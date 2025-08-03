export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            {/* Simple layout with no navbar or footer */}
            <main>{children}</main>
        </div>
    );
}
