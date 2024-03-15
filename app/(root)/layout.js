import { Inter } from "next/font/google";
import "../globals.css";
import Header from "@/components/Header";

export const metadata = {
  title: "prodmarket",
  description: "a marketplace to collaborate with other producers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-inter relative">
        <Header style="sticky" />
        <main className="relative overflow-hidden">{children}</main>
      </body>
    </html>
  );
}
