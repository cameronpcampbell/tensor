import ReactMarkdown from "react-markdown"
import {visit} from 'unist-util-visit'
import remarkGfm from "remark-gfm"
import { type Root } from "hast"

import { CodeBlock, InlineCode } from "./elements"

import styles from "./markdown.module.scss"


const rehypeInlineCodeProperty = () => {
  return (tree: Root) => {
    visit(tree, 'element', (node, _, parent) => {
      if (node.tagName !== 'code') return;

      if (parent?.type === 'element' && parent.tagName === 'pre') {
        node.properties = { ...node.properties, inline: false }
      } else {
        node.properties = { ...node.properties, inline: true }
      }
    })
  }
}

const arrayPush = <T extends any[],>(arr: T, toPush: T | null | undefined) => {
    if (!toPush) return arr
    arr.push(...toPush)
    return arr
}

export const Markdown = ({ remarkPlugins, rehypePlugins, ...rest }: Parameters<typeof ReactMarkdown>[0]) => (
    <span className={styles.markdown}>
        <ReactMarkdown
            remarkPlugins={arrayPush([ remarkGfm ], remarkPlugins)}
            rehypePlugins={arrayPush([ rehypeInlineCodeProperty ], rehypePlugins)}
            components={{
                code: (
                    { className, children, inline, ...rest }: any) => {
                    return inline
                        ? <InlineCode className={className} children={children} {...rest} />
                        : <CodeBlock className={className} children={children} {...rest} />
                }
            }}
            {...rest}
        />
    </span>
)