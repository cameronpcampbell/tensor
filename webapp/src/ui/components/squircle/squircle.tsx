"use client"

import { getSvgPath } from 'figma-squircle'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { ElementName, ElementProps } from "@/utils/types"

import styles from "./squircle.module.scss"

type SquircleOptions = {
    borderWidth?: number,
    cornerSmoothing?: number,
    preserveSmoothing?: boolean,
    cornerRadius?: number,
    topLeftCornerRadius?: number,
    topRightCornerRadius?: number,
    bottomRightCornerRadius?: number,
    bottomLeftCornerRadius?: number
}

type CornerSmoothingRadiusProps = {
  cornerRadius?: number,
  topLeftCornerRadius?: number | boolean,
  topRightCornerRadius?: number | boolean,
  bottomRightCornerRadius?: number | boolean,
  bottomLeftCornerRadius?: number | boolean
}

export interface CornerSmoothingProps extends CornerSmoothingRadiusProps {
    cornerSmoothing?: number,
    preserveSmoothing?: boolean,
    borderWidth?: number
}

export interface SquircleProps<As extends ElementName = "div"> extends Omit<ElementProps<ElementName>, "as">, CornerSmoothingProps {
    as?: As
}

const squircleMask = (svgA: string) =>
    `url("data:image/svg+xml;utf8,${encodeURIComponent(svgA)}")`

const squircleOuterSvg = (
    width: number, height: number, options: SquircleOptions
) => {
    const svgPath = getSvgPath({
        width,
        height,
        cornerSmoothing: 1,
        ...options
    })

    return `
        <svg width="${width}" height="${height}" viewbox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <path d="${svgPath}" shape-rendering="geometricPrecision" />
        </svg>
    `
}

const squircleInnerSvg = (
    width: number, height: number, options: SquircleOptions
) => {
    const {
        borderWidth = 1, cornerRadius = 0, topLeftCornerRadius, topRightCornerRadius, bottomLeftCornerRadius, bottomRightCornerRadius
    } = options

    const innerWidth = width - borderWidth * 2
    const innerHeight = height - borderWidth * 2

    const innerSvgPath = getSvgPath({
        width: innerWidth,
        height: innerHeight,
        cornerSmoothing: 1,
        ...options,
        cornerRadius: Math.max(cornerRadius - borderWidth, 0),
        topLeftCornerRadius: topLeftCornerRadius && Math.max(topLeftCornerRadius - borderWidth, 0),
        topRightCornerRadius: topRightCornerRadius && Math.max(topRightCornerRadius - borderWidth, 0),
        bottomLeftCornerRadius: bottomLeftCornerRadius && Math.max(bottomLeftCornerRadius - borderWidth, 0),
        bottomRightCornerRadius: bottomRightCornerRadius && Math.max(bottomRightCornerRadius - borderWidth, 0),
    })

    return `
        <svg width="${width}" height="${height}" viewbox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <path  d="${innerSvgPath}" shape-rendering="geometricPrecision" transform="translate(${borderWidth}, ${borderWidth})" />
        </svg>
    `
}

const renderSquircle = (
    element: HTMLElement, width: number, height: number, options: SquircleOptions
) => {
    element.classList.remove(styles.squirclePre as string)
    element.classList.add(styles.squirclePost as string)

    let outerMask = squircleMask(squircleOuterSvg(width, height, options))

    element.style.maskImage = outerMask;

    if (options.borderWidth !== 0) {
        element.style.setProperty("--outer-squircle-mask-image", outerMask);
        element.style.setProperty("--inner-squircle-mask-image", squircleMask(squircleInnerSvg(width, height, options)))
    }
}

const EPSILON = Number.EPSILON * Math.pow(2, -126); 

const nearlyEqual = (a: number, b: number, epsilon: number = EPSILON) => Math.abs(a - b) < epsilon

const squircleObserver = (element: HTMLElement, options: SquircleOptions) => {
    let lastWidth = 0
    let lastHeight = 0

    const func = (newOptions: SquircleOptions | undefined, width: number, height: number) => {
        if (newOptions !== undefined) {
            options = newOptions
        }

        renderSquircle(element, width, height, options)
    };

    const resizeObserver = new ResizeObserver(() => {
        let currentWidth = element.clientWidth
        let currentHeight = element.clientHeight

        // Run only if dimensions have changed accounting for a margin, for performance.
        if (
            !nearlyEqual(lastWidth, currentWidth) ||
            !nearlyEqual(lastHeight, currentHeight)
        ) { func(undefined, currentWidth, currentHeight) }

        lastWidth = currentWidth
        lastHeight = currentHeight
    });

    resizeObserver.observe(element, { box: 'border-box' })
    func.disconnect = () => resizeObserver.disconnect()
    
    return func;
}

const mapIfExists = <T, R>(value: T, callback: (t: NonNullable<T>) => R): R | undefined => value ? callback(value) : undefined

const resolveCornerRadius = (thisRadius: number | boolean | undefined, globalRadius: number) => {
    return thisRadius == true || thisRadius == undefined ? globalRadius : thisRadius == false ? 0 : thisRadius
}

export const Squircle = <As extends ElementName = "div",>({
    className,
    style,
    ref, 
    borderWidth = 1,
    cornerSmoothing = 1,
    preserveSmoothing = true,
    cornerRadius = 0,
    topLeftCornerRadius:_topLeftCornerRadius,
    topRightCornerRadius:_topRightCornerRadius,
    bottomRightCornerRadius:_bottomRightCornerRadius,
    bottomLeftCornerRadius:_bottomLeftCornerRadius,
    as,
    ...rest
}: SquircleProps<As>) => {
    const topLeftCornerRadius = resolveCornerRadius(_topLeftCornerRadius, cornerRadius)
    const topRightCornerRadius = resolveCornerRadius(_topRightCornerRadius, cornerRadius)
    const bottomRightCornerRadius = resolveCornerRadius(_bottomRightCornerRadius, cornerRadius)
    const bottomLeftCornerRadius = resolveCornerRadius(_bottomLeftCornerRadius, cornerRadius)

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

    const [ {
        cornerRadius: cornerRadiusStyle,
        topLeftCornerRadius: topLeftCornerRadiusStyle,
        topRightCornerRadius: topRightCornerRadiusStyle,
        bottomRightCornerRadius: bottomRightCornerRadiusStyle,
        bottomLeftCornerRadius: bottomLeftCornerRadiusStyle
    }, setCornerRadiusState ] = useState<{
        cornerRadius?: number,
        topLeftCornerRadius?: number,
        topRightCornerRadius?: number,
        bottomRightCornerRadius?: number,
        bottomLeftCornerRadius?: number
    }>({
        cornerRadius,
        topLeftCornerRadius,
        topRightCornerRadius,
        bottomRightCornerRadius,
        bottomLeftCornerRadius,
    });

    useEffect(() => setCornerRadiusState({}), []);

    let As = (as ?? "div") as string

    return <>
        <As
            className={[ styles.squircle, styles.squirclePre, className ].join(" ")}
            style={{
                ["--squircle-border-width"]: `${borderWidth}px`,
                borderRadius: cornerRadiusStyle,
                ["--squircle-inner-border-radius"]: mapIfExists(cornerRadiusStyle, r => `${r - borderWidth}px`),
                borderTopLeftRadius: topLeftCornerRadiusStyle,
                ["--squircle-inner-border-top-left-radius"]: mapIfExists(topLeftCornerRadiusStyle,r => `${r - borderWidth}px`),
                borderTopRightRadius: topRightCornerRadiusStyle,
                ["--squircle-inner-border-top-right-radius"]: mapIfExists(topRightCornerRadiusStyle, r => `${r - borderWidth}px`),
                borderBottomRightRadius: bottomRightCornerRadiusStyle,
                ["--squircle-inner-border-bottom-right-radius"]: mapIfExists(bottomRightCornerRadiusStyle, r => `${r - borderWidth}px`),
                borderBottomLeftRadius: bottomLeftCornerRadiusStyle,
                ["--squircle-inner-border-bottom-left-radius"]: mapIfExists(bottomLeftCornerRadiusStyle, r => `${r - borderWidth}px`),
                ...style
            }}
            ref={refCallback}
            {...rest as any}
        >
        </As>
    </>
}