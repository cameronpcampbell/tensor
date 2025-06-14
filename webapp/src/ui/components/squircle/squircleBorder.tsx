"use client"

import { getSvgPath } from 'figma-squircle'
import { useCallback, useRef } from 'react'
import type { ElementName, ElementProps } from "@/utils/types"

import styles from "./squircleBorder.module.scss"

type SquircleBorderOptions = {
    borderWidth?: number,
    cornerSmoothing?: number,
    preserveSmoothing?: boolean,
    cornerRadius?: number,
    topLeftCornerRadius?: number,
    topRightCornerRadius?: number,
    bottomRightCornerRadius?: number,
    bottomLeftCornerRadius?: number
}

type SquircleBorderProps<AsType extends ElementName> = ElementProps<AsType> & SquircleBorderOptions & {
    as?: AsType
};

const renderSquircleBorder = (element: HTMLElement, options: SquircleBorderOptions) => {
    const { borderWidth = 1, cornerRadius = 0, cornerSmoothing = 1 } = options

    const width = element.clientWidth
    const height = element.clientHeight

    const innerWidth = width - borderWidth * 2
    const innerHeight = height - borderWidth * 2

    const svgPath = getSvgPath({
        width,
        height,
        cornerRadius,
        cornerSmoothing
    })

    const innerSvgPath = getSvgPath({
        width: innerWidth,
        height: innerHeight,
        cornerRadius: Math.max(cornerRadius - borderWidth, 0),
        cornerSmoothing
    })

    let svgMask = `
        <svg width="${width}" height="${height}" viewbox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <path d="${svgPath}" shape-rendering="geometricPrecision" />
        </svg>
    `

    let innerSvgMask = `
        <svg width="${width}" height="${height}" viewbox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <path  d="${innerSvgPath}" shape-rendering="geometricPrecision" transform="translate(${borderWidth}, ${borderWidth})" />
        </svg>
    `

    element.classList.remove(styles.squirclePre as string)
    element.classList.add(styles.squirclePost as string)

    element.style.maskImage = `
        url("data:image/svg+xml;utf8,${encodeURIComponent(innerSvgMask)}"), url("data:image/svg+xml;utf8,${encodeURIComponent(svgMask)}")
    `
}

const EPSILON = Number.EPSILON * Math.pow(2, -126); 

const nearlyEqual = (a: number, b: number, epsilon: number = EPSILON) => Math.abs(a - b) < epsilon

const squircleObserver = (element: HTMLElement, options: SquircleBorderOptions) => {
    let dimensions: [number, number] = [0,0]

    const func = (newOptions?: SquircleBorderOptions) => {
        if (newOptions !== undefined) {
            options = newOptions
        }

        renderSquircleBorder(element, options)
    };

    const resizeObserver = new ResizeObserver(() => {
        const prevDimemsions = dimensions;
        dimensions = [element.clientWidth, element.clientHeight];

        // Run only if dimensions changed, for performance.
        if (
            !nearlyEqual(prevDimemsions[0], dimensions[0]) ||
            !nearlyEqual(prevDimemsions[1], dimensions[1])
        ) { func() }
    });

    resizeObserver.observe(element, { box: 'border-box' })
    func.disconnect = () => resizeObserver.disconnect()
    
    return func;
}

export const SquircleBorder = <As extends ElementName = "div",>({
    className,
    style,
    ref, 
    borderWidth = 1,
    cornerSmoothing = 1,
    preserveSmoothing = true,
    cornerRadius = 0,
    topLeftCornerRadius,
    topRightCornerRadius,
    bottomRightCornerRadius,
    bottomLeftCornerRadius,
    as,
    ...rest
}: SquircleBorderProps<As>) => {
    const funcRef = useRef<ReturnType<typeof squircleObserver>>(undefined);

    let refCallback = useCallback((element: HTMLElement | null) => {
        const options = {
            borderWidth,
            cornerSmoothing,
            preserveSmoothing,
            cornerRadius,
            topLeftCornerRadius,
            topRightCornerRadius,
            bottomRightCornerRadius,
            bottomLeftCornerRadius
        }

        funcRef.current?.disconnect();

        if (element) {
            funcRef.current = squircleObserver(element, options);
        }

        if (typeof ref === "function") {
            ref(element as any)
        } else if (ref) {
            ref.current = element
        }
    }, [])

    let As = (as ?? "div") as string

    return <>
        <As
            className={[ styles.squircle, styles.squirclePre, className, "squircleBorder" ].join(" ")}
            style={{
                ["--corner-radius"]: `${cornerRadius}px`,
                ["--border-width"]: `${borderWidth}px`,
                ...style
            }}
            ref={refCallback}
            {...rest as any}
        >
        </As>
    </>
}