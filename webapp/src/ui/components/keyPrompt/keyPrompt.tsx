"use client"


import type { HTMLProps } from "react";

import { Squircle, SquircleBorder } from "~/ui/components";

import styles from "./keyPrompt.module.scss"

export const KeyPrompt = ({ children, className }: HTMLProps<"div">) => (
    <Squircle cornerRadius={3.7} className={[ styles.keyPrompt, className ].join(" ")}>
        <SquircleBorder className={styles.border} cornerRadius={3.7} borderWidth={1} />
        <p>{ children }</p>
    </Squircle>
)