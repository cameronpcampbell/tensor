"use client"


import type { HTMLProps } from "react";

import { Squircle } from "@/ui/components";

import styles from "./keyPrompt.module.scss"

export const KeyPrompt = ({ children, className }: HTMLProps<"div">) => (
    <Squircle cornerRadius={3.7} borderWidth={1} className={[ styles.keyPrompt, className ].join(" ")}>
        <p>{ children }</p>
    </Squircle>
)