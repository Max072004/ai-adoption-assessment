import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "AI Adoption Assessment Portal",
  description: "Monthly employee AI adoption assessment and review portal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
