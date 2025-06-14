import { type Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "~/app/globals.scss";
import "~/ui/components/base.scss";

export const metadata: Metadata = {
    title: "Tensor",
    description: "An Open-Source AI Chat Appp.",
    icons: [{ rel: "icon", url: "/favicon.ico", type:"image/x-icon", sizes:"16x16" }],
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className="tensorui dark">
            <body>{children}</body>
        </html>
    );
}
