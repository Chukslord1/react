import React, {forwardRef, MouseEventHandler, useMemo} from 'react'
import TokenBase, {TokenBaseProps, isTokenInteractive} from '../../Token/TokenBase'
import {hexString, isHex} from '../utils/isHex'
import {CSSObject} from 'styled-components'
import {ForwardRefComponent as PolymorphicForwardRefComponent} from '../../utils/polymorphic'
import {getColorsFromHex} from './getColorsFromHex'
import {useTheme} from '../../ThemeProvider'
import TokenTextContainer from '../../Token/_TokenTextContainer'
import RemoveTokenButton from '../../Token/_RemoveTokenButton'
import './temp.v8Tokens.css'

export type Variants =
  | 'pink'
  | 'plum'
  | 'purple'
  | 'indigo'
  | 'blue'
  | 'cyan'
  | 'teal'
  | 'pine'
  | 'green'
  | 'lime'
  | 'olive'
  | 'lemon'
  | 'yellow'
  | 'orange'
  | 'amber'
  | 'red'
  | 'coral'
  | 'gray'
  | 'brown'
  | 'auburn'

export interface IssueLabelTokenProps extends TokenBaseProps {
  variant?: Variants
  fillColor?: hexString
}

export type variantColor = {
  backgroundColor: string
  textColor: string
  borderColor?: string
  backgroundColorHover?: string
  backgroundColorPressed?: string
}

const variantColors = (variant: Variants): variantColor => ({
  backgroundColor: `var(--label-${variant}-bgColor-rest)`,
  backgroundColorHover: `var(--label-${variant}-bgColor-hover)`,
  backgroundColorPressed: `var(--label-${variant}-bgColor-pressed)`,
  textColor: `var(--label-${variant}-fgColor)`,
})

const getLabelColors = (
  variant?: Variants,
  fillColor?: hexString,
  resolvedColorScheme = 'light',
  bgColor = '#ffffff',
): variantColor => {
  // valid variant
  if (variant) {
    return variantColors(variant)
  }
  // valid hex string
  if (fillColor && isHex(fillColor)) {
    return getColorsFromHex(fillColor, resolvedColorScheme, false, bgColor) // TODO: remove false prop if no selection nessesary for tokens
  }
  // if invalid variant and invalid hex string, return default
  return variantColors('gray')
}

const IssueLabelToken = forwardRef((props, forwardedRef) => {
  const {
    variant,
    fillColor,
    onRemove,
    hideRemoveButton, // could we just use onRemove? and hide it if it has no function?
    id,
    isSelected, // is this needed on issue label tokens?
    text,
    size = 'medium', // this is not needed
    as, // do we need to expose this?
    href, // or could we just do it depending on href or onClick?
    onClick,
    ...rest
  } = props

  const interactiveTokenProps = {
    as,
    href,
    onClick,
  }

  const {resolvedColorScheme, theme} = useTheme()
  const bgColor =
    getComputedStyle(document.documentElement).getPropertyValue(theme?.colors.canvas.default) ||
    resolvedColorScheme?.startsWith('light')
      ? '#ffffff'
      : '#000000'

  const hasMultipleActionTargets = isTokenInteractive(props) && Boolean(onRemove) && !hideRemoveButton

  const onRemoveClick: MouseEventHandler = e => {
    e.stopPropagation()
    onRemove && onRemove()
  }

  const labelStyles: CSSObject = useMemo(() => {
    // TODO: border can be removed if we don't need selected states
    const {backgroundColor, textColor, borderColor, backgroundColorHover, backgroundColorPressed} = getLabelColors(
      variant,
      fillColor,
      resolvedColorScheme,
      bgColor,
    )

    return {
      paddingRight: hideRemoveButton || !onRemove ? undefined : 0,
      position: 'relative',
      backgroundColor,
      color: textColor,
      border: `1px solid ${borderColor || backgroundColor}`,
      ...(isTokenInteractive(props)
        ? {
            '&:hover': {
              background: backgroundColorHover || backgroundColor,
              border: `1px solid ${borderColor || backgroundColorHover || backgroundColor}`,
            },
            '&:active': {
              background: backgroundColorPressed || backgroundColor,
              border: `1px solid ${borderColor || backgroundColorPressed || backgroundColor}`,
            },
          }
        : {}),
    }
  }, [variant, fillColor, resolvedColorScheme, bgColor, hideRemoveButton, onRemove, props])

  return (
    <TokenBase // TODO: does it make sense to extend TokenBase?
      onRemove={onRemove}
      id={id?.toString()}
      isSelected={isSelected}
      text={text}
      size={size}
      sx={labelStyles}
      {...(!hasMultipleActionTargets ? interactiveTokenProps : {})} // TODO: what is this doing? What is hasMultipleActionTargets doing?
      {...rest}
      ref={forwardedRef}
    >
      <TokenTextContainer {...(hasMultipleActionTargets ? interactiveTokenProps : {})}>{text}</TokenTextContainer>
      {!hideRemoveButton && onRemove ? (
        <RemoveTokenButton
          onClick={onRemoveClick}
          size={size}
          aria-hidden={hasMultipleActionTargets ? 'true' : 'false'}
          isParentInteractive={isTokenInteractive(props)}
          sx={
            hasMultipleActionTargets
              ? {
                  position: 'relative',
                  zIndex: '1',
                }
              : {}
          }
        />
      ) : null}
    </TokenBase>
  )
}) as PolymorphicForwardRefComponent<'span' | 'a' | 'button', IssueLabelTokenProps> // TODO: why do we need span?
// TODO: what is PolymorphicForwardRefComponent doing?

IssueLabelToken.displayName = 'IssueLabelToken' // TODO: is this needed?

export default IssueLabelToken
