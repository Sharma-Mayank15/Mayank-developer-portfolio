import { GoogleTagManager } from "@next/third-parties/google";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { personalData } from "@/utils/data/personal-data";
import CommandPalette from "./components/command-palette";
import Footer from "./components/footer";
import Navbar from "./components/navbar";
import "./css/globals.scss";

const sans = Geist({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const description =
  "Mayank Sharma — AI & Software Engineer. Builds applied-AI systems (computer vision, RAG/LLM apps, deep RL) like Guardian Lens, and ships them in real-time React & TypeScript products at Ditstek Innovations.";

export const metadata = {
  metadataBase: new URL(personalData.siteUrl),
  title: {
    default: "Mayank Sharma — AI & Software Engineer",
    template: "%s · Mayank Sharma",
  },
  description,
  keywords: ["Mayank Sharma", "AI Engineer", "Software Engineer", "LLM", "RAG", "Computer Vision", "React", "TypeScript", "Frontend", "AI", "Portfolio"],
  openGraph: {
    title: "Mayank Sharma — AI & Software Engineer",
    description,
    url: personalData.siteUrl,
    siteName: "Mayank Sharma",
    images: [{ url: personalData.profile }],
    type: "website",
  },
  twitter: { card: "summary", title: "Mayank Sharma — AI & Software Engineer", description },
};

export const viewport = {
  themeColor: "#07080a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${serif.variable}`}>
      <body className="grain font-sans">
        <ToastContainer theme="dark" position="bottom-right" />
        <Navbar />
        <CommandPalette />
        <main className="relative">{children}</main>
        <Footer />
      </body>
      {process.env.NEXT_PUBLIC_GTM && <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM} />}
    </html>
  );
}
