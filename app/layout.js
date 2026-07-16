export const metadata = {
  title: "My AI Agent",
  description: "A phone-friendly personal AI assistant",
  manifest: "/manifest.json"
};

export default function RootLayout({ children }) {
  return (
    <html lang="az">
      <body>{children}</body>
    </html>
  );
}
