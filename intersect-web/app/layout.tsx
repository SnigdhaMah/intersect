import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Event Planning App",
  description: "Coordinate events with multiple calendars",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-900">
        {children}
      </body>
    </html>
  );
}