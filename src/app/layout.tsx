import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Timetable Generator",
  description: "A simple timetable generator for teachers and lecturers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <header className="bg-gray-800 text-white p-4">
            <h1 className="text-xl">Timetable Generator</h1>
          </header>
          <main className="flex-grow p-4">{children}</main>
          <footer className="bg-gray-800 text-white p-4 text-center">
            <p>&copy; {new Date().getFullYear()} Timetable Generator</p>
          </footer>
        </div>
      </body>
    </html>
  );
}