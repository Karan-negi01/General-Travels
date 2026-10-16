import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
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
    <html lang="en" className={jakarta.variable}>
      <body>{children}</body>
    </html>
  );
}
