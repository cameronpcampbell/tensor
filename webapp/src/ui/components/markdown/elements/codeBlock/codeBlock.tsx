import { useEffect, useMemo, useState } from "react"
import { codeToHtml, createHighlighter, type BundledLanguage, type BundledTheme, type HighlighterGeneric } from 'shiki'

import { Squircle } from "@/ui/components"

import styles from "./codeBlock.module.scss"

const highlighter = await createHighlighter({
    themes: ["github-dark-default"],
    langs: [],
})

const shikiLangExists = (highlighter: HighlighterGeneric<BundledLanguage, BundledTheme>, lang: string) => {
    try { highlighter.getLanguage(lang) } catch { return false }
    return true
}

export const CodeBlock = ({
    className, children, ...rest
}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>) => {
    const lang = useMemo(() => /language-(\w+)/.exec(className || '')?.[1], [])

    if (typeof children === "string") {
        const [ code, setCode ] = useState(highlighter.codeToHtml(children, {
            lang: (lang && shikiLangExists(highlighter, lang) && lang || undefined) as any,
            theme: "github-dark-default",
            tabindex: false,
            ...rest
        }))

        try {
            useEffect(() => {
                (async () => {
                    try {
                        await highlighter.loadLanguage(lang as any)
                    } catch {}

                    setCode(highlighter.codeToHtml(children, {
                        lang: lang ?? "plaintext",
                        theme: "github-dark-default",
                        tabindex: false
                    }))
                })()
            }, [])

            return <Squircle cornerRadius={8} className={[ className, styles.codeBlock ].join(" ")} as="code">
                <Squircle className={styles.border} cornerRadius={8} as="code" />
                <header className={styles.header}>{lang ?? "plaintext"}</header>

                <span className={styles.highlightedCode} dangerouslySetInnerHTML={{ __html: code }} />
            </Squircle>
        } catch {}
    }

    return <Squircle cornerRadius={8} className={[ className, styles.codeBlock ].join(" ")} as="code">
        <Squircle className={styles.border} cornerRadius={8} as="code" />
        <header className={styles.header}>{lang ?? "plaintext"}</header>
        
        <span className={styles.unhighlightedCode}>{children}</span>
    </Squircle>
}