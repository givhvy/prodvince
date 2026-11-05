import { Instrument_Serif } from "next/font/google";
import localFont from "next/font/local";

export const heading = localFont({
  src: [
    {
      path: "../../public/fonts/Satoshi-Variable.woff2",
      weight: "300 900",
      style: "normal",
    },
  ],
  variable: "--font-heading",
  display: "swap",
  preload: true,
  fallback: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
});

export const subheading = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-subheading",
  display: "optional",
  preload: false,
  adjustFontFallback: true,
});
