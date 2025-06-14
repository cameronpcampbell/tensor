"use client"

import TextareaAutosizeReact, { type TextareaAutosizeProps as _TextareaAutosizeProps  } from 'react-textarea-autosize';
import type { ElementProps } from "@/utils/types";

import styles from "./textareaAutosize.module.scss"

interface TextareaAutosizeProps extends _TextareaAutosizeProps, Omit<ElementProps<"textarea">, keyof _TextareaAutosizeProps> {}

export const TextareaAutosize = ({ className, ...rest }: TextareaAutosizeProps) => (
    <TextareaAutosizeReact className={[ styles.textareaAutosize, className ].join(" ")} {...rest as any} />
)