import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Pet-Chip Documentation",
  description: "Comprehensive documentation for the Pet-Chip Animal Identification and Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
