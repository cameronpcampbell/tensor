import { type Metadata } from "next";

import "@/app/globals.scss";
import "@/ui/components/base.scss";
import { Providers } from "./providers";

export const metadata: Metadata = {
    title: "Tensor",
    description: "An Open-Source AI Chat Appp.",
    icons: [
        { rel: "icon", url: "/favicon.ico", type:"image/x-icon", sizes:"16x16" },
        { rel: "icon", url: "/favicon.svg", type:"image/svg+xml", sizes:"16x16" }
    ],
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className="tensorui dark">
            <Providers>
                <body>{children}</body>
            </Providers>
        </html>
    );
}
