import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Headache Tracker',
    description: 'Track and manage your headache history',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="antialiased bg-gray-950 text-white min-h-screen">
                {children}
            </body>
        </html>
    );
}
