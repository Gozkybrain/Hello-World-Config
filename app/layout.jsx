import "./globals.css";
import Header from "@/components/Header";

export const metadata = {
  title: "Hello World Control Panel",
  description:
    "Run Hello World Jobs locally: browse jobs, connect engines, and generate roadmaps.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
