import { Oswald } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const themeInitScript = `(function(){try{var t=localStorage.getItem("hw-theme");if(!t){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="dark"}})();`;

export const metadata = {
  title: "Hello World Control Panel",
  description:
    "Run Hello World Jobs locally: browse jobs, connect engines, and generate roadmaps.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" className={oswald.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <Sidebar />
        <div className="hw-shell">{children}</div>
      </body>
    </html>
  );
}
