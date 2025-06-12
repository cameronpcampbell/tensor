"use client"

import { useEffect, useState, type JSX } from 'react'
import { Squircle as CornerSmoothing } from 'corner-smoothing'
import type { ElementName, ElementProps } from '~/utils/types'

import styles from "./squircle.module.scss"

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

const resolveCornerRadius = (thisRadius: number | boolean | undefined, globalRadius: number) => {
    return thisRadius == true || thisRadius == undefined ? globalRadius : thisRadius == false ? 0 : thisRadius
}

const mapIfExists = <T, R>(value: T, callback: (t: NonNullable<T>) => R): R | undefined => value ? callback(value) : undefined

export const Squircle = <As extends ElementName = "div",>({
    as = "div" as any, className, style,
    cornerRadius = 0,
    topLeftCornerRadius:_topLeftCornerRadius = cornerRadius,
    topRightCornerRadius:_topRightCornerRadius = cornerRadius,
    bottomRightCornerRadius:_bottomRightCornerRadius = cornerRadius,
    bottomLeftCornerRadius:_bottomLeftCornerRadius = cornerRadius,
    borderWidth = 0, children, ...rest
}: SquircleProps<As>) => {
    const topLeftCornerRadius = resolveCornerRadius(_topLeftCornerRadius, cornerRadius)
    const topRightCornerRadius = resolveCornerRadius(_topRightCornerRadius, cornerRadius)
    const bottomRightCornerRadius = resolveCornerRadius(_bottomRightCornerRadius, cornerRadius)
    const bottomLeftCornerRadius = resolveCornerRadius(_bottomLeftCornerRadius, cornerRadius)

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

    return <CornerSmoothing
        as={as}
        className={[ styles.squircle, className ].join(" ")}
        style={{
            ...style,
            ["--squircleBorderWidth"]: `${borderWidth}px`,
            borderRadius: cornerRadiusStyle,
            ["--squircleInnerBorderRadius"]: mapIfExists(cornerRadiusStyle, r => `${r - borderWidth}px`),
            borderTopLeftRadius: topLeftCornerRadiusStyle,
            ["--squircleInnerBorderTopLeftRadius"]: mapIfExists(topLeftCornerRadiusStyle,r => `${r - borderWidth}px`),
            borderTopRightRadius: topRightCornerRadiusStyle,
            ["--squircleInnerBorderTopRightRadius"]: mapIfExists(topRightCornerRadiusStyle, r => `${r - borderWidth}px`),
            borderBottomRightRadius: bottomRightCornerRadiusStyle,
            ["--squircleInnerBorderBottomRightRadius"]: mapIfExists(bottomRightCornerRadiusStyle, r => `${r - borderWidth}px`),
            borderBottomLeftRadius: bottomLeftCornerRadiusStyle,
            ["--squircleInnerBorderBottomLeftRadius"]: mapIfExists(bottomLeftCornerRadiusStyle, r => `${r - borderWidth}px`),
        }}
        cornerRadius={cornerRadius}
        topLeftCornerRadius={topLeftCornerRadius}
        topRightCornerRadius={topRightCornerRadius}
        bottomRightCornerRadius={bottomRightCornerRadius}
        bottomLeftCornerRadius={bottomLeftCornerRadius}
        borderWidth={borderWidth}
        data-borderwidth={borderWidth > 0}
        {...rest as any}
    >
        {children}
    </CornerSmoothing>
}