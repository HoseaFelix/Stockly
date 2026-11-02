import "./globals.css";

export const metadata = {
  title: "STOCKLY — A fresher way to shop in Osogbo",
  description: "STOCKLY is coming soon to Osogbo. Tell us what would make grocery shopping easier and be among the first to hear when we launch.",
  icons: { icon: "/stockly-icon.png", apple: "/stockly-icon.png" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
