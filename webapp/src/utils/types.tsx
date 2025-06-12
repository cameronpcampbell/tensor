import type { JSX } from "react";

export type ElementProps<T extends ElementName> = JSX.IntrinsicElements[T]

export type ElementName = keyof JSX.IntrinsicElements

