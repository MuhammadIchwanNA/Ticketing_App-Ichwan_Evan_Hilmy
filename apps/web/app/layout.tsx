import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import QuickLogin from "../components/QuickLogin";
import { AuthProvider } from "../contexts/AuthContext";
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Enjoyor – Find events you'll love",
  description: "Discover and book the best events in your city or online.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.variable} antialiased font-sans`}>
        <AuthProvider>
          <Navbar />
          {children}
          <Footer />
          <QuickLogin />
        </AuthProvider>
      </body>
    </html>
  );
}