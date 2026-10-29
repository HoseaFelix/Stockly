import "./globals.css";

export const metadata = {
  title: "GROCERLY — A fresher way to shop in Osogbo",
  description: "GROCERLY is coming soon to Osogbo. Tell us what would make grocery shopping easier and be among the first to hear when we launch.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
