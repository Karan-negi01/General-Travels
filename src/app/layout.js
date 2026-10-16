import { Manrope, Fraunces } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

// Editorial serif for display headings on marketing pages.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata = {
  title: {
    default: "General Travels — Premium bus & coach hire",
    template: "%s · General Travels",
  },
  description:
    "Hire verified luxury coaches, buses and tempo travellers at a fixed, upfront price. Every operator and every bus is checked by General Travels.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${manrope.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
