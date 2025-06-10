"use client"

import TextareaAutosizeReact, { type TextareaAutosizeProps } from 'react-textarea-autosize';

import styles from "./textareaAutosize.module.scss"

export const TextareaAutosize = ({ className, ...rest }: TextareaAutosizeProps) => (
    <TextareaAutosizeReact className={[ styles.textareaAutosize, className ].join(" ")} {...rest} />
)