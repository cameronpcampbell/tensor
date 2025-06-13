import { useMemo } from "react"
import { codeToHtml, createHighlighter } from 'shiki'

import { Squircle, SquircleBorder } from "~/ui/components"

import styles from "./codeBlock.module.scss"

const highlighter = await createHighlighter({
    themes: ["github-dark-default"],
    langs: ["ts", "js", "css", "lua", "luau", "jsx"],
    langAlias: {
        "luau": "lua"
    }
})

export const CodeBlock = ({
    className, children
}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>) => {
    const lang = useMemo(() => /language-(\w+)/.exec(className || '')?.[1], [])

    if (typeof children === "string") {
        try {
            let code = highlighter.codeToHtml(children, {
                lang: lang as any,
                theme: "github-dark-default",
                tabindex: false
            })

            return <Squircle cornerRadius={8} className={[ className, styles.codeBlock ].join(" ")} as="code">
                <SquircleBorder className={styles.border} cornerRadius={8} as="code" />
                <header className={styles.header}>{lang ?? "plaintext"}</header>

                <span className={styles.highlightedCode} dangerouslySetInnerHTML={{ __html: code }} />
            </Squircle>
        } catch {}
    }

    return <Squircle cornerRadius={8} className={[ className, styles.codeBlock ].join(" ")} as="code">
        <SquircleBorder className={styles.border} cornerRadius={8} as="code" />
        <header className={styles.header}>{lang ?? "plaintext"}</header>
        
        <span className={styles.unhighlightedCode}>{children}</span>
    </Squircle>
}