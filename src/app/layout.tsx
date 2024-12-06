import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Служба занятости",
	description: "Курсовая работа Морозова Михаила",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`
          antialiased`}
			>
				{children}
			</body>
		</html>
	);
}
