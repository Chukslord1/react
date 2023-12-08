import React, {useCallback, useEffect, useRef, useState} from 'react'
import styled from 'styled-components'
import {XIcon} from '@primer/octicons-react'
import {FocusKeys} from '@primer/behaviors'

import Button, {ButtonPrimary, ButtonDanger, ButtonProps} from '../deprecated/Button'
import Box from '../Box'
import {get} from '../constants'
import Portal from '../Portal'
import {useOnEscapePress, useProvidedRefOrCreate} from '../hooks'
import {useFocusTrap} from '../hooks/useFocusTrap'
import sx, {SxProp} from '../sx'
import {ResponsiveValue, useResponsiveValue} from '../hooks/useResponsiveValue'
import Octicon from '../Octicon'
import {useFocusZone} from '../hooks/useFocusZone'
import {useRefObjectAsForwardedRef} from '../hooks/useRefObjectAsForwardedRef'
import {useId} from '../hooks/useId'

import DialogActionSheet from './DialogActionSheet'

/* Dialog Version 2 */

const ANIMATION_DURATION = '200ms'

/**
 * Props that characterize a button to be rendered into the footer of
 * a Dialog.
 */
export type DialogButtonProps = Omit<ButtonProps, 'content'> & {
  /**
   * The type of Button element to use
   */
  buttonType?: 'normal' | 'primary' | 'danger'

  /**
   * The Button's inner text
   */
  content: React.ReactNode

  /**
   * If true, and if this is the only button with autoFocus set to true,
   * focus this button automatically when the dialog appears.
   */
  autoFocus?: boolean

  /**
   * A reference to the rendered Button’s DOM node, used together with
   * `autoFocus` for `focusTrap`’s `initialFocus`.
   */
  ref?: React.RefObject<HTMLButtonElement>
}

/**
 * Props to customize the rendering of the Dialog.
 */
export interface DialogProps extends SxProp {
  /**
   * Title of the Dialog. Also serves as the aria-label for this Dialog.
   */
  title?: React.ReactNode

  /**
   * The Dialog's subtitle. Optional. Rendered below the title in smaller
   * type with less contrast. Also serves as the aria-describedby for this
   * Dialog.
   */
  subtitle?: React.ReactNode

  /**
   * Provide a custom renderer for the dialog header. This content is
   * rendered directly into the dialog body area, full bleed from edge
   * to edge, top to the start of the body element.
   *
   * Warning: using a custom renderer may violate Primer UX principles.
   */
  renderHeader?: React.FunctionComponent<React.PropsWithChildren<DialogHeaderProps>>

  /**
   * Provide a custom render function for the dialog body. This content is
   * rendered directly into the dialog body area, full bleed from edge to
   * edge, header to footer.
   *
   * Warning: using a custom renderer may violate Primer UX principles.
   */
  renderBody?: React.FunctionComponent<React.PropsWithChildren<DialogProps>>

  /**
   * Provide a custom render function for the dialog footer. This content is
   * rendered directly into the dialog footer area, full bleed from edge to
   * edge, end of the body element to bottom.
   *
   * Warning: using a custom renderer may violate Primer UX principles.
   */
  renderFooter?: React.FunctionComponent<React.PropsWithChildren<DialogProps>>

  /**
   * Specifies the buttons to be rendered in the Dialog footer.
   */
  footerButtons?: DialogButtonProps[]

  /**
   * This method is invoked when a gesture to close the dialog is used (either
   * an Escape key press or clicking the "X" in the top-right corner). The
   * gesture argument indicates the gesture that was used to close the dialog
   * (either 'close-button' or 'escape').
   */
  onClose: (gesture: 'close-button' | 'escape' | 'drag' | 'overlay') => void

  /**
   * Default: "dialog". The ARIA role to assign to this dialog.
   * @see https://www.w3.org/TR/wai-aria-practices-1.1/#dialog_modal
   * @see https://www.w3.org/TR/wai-aria-practices-1.1/#alertdialog
   */
  role?: 'dialog' | 'alertdialog'

  /**
   * Normally a dialog is display in the center of a viewport but sometimes
   * it is useful to display this full screen or as an action sheet on mobile viewports
   * to allow for more space for content. When full-screen or action sheet the width
   * and height is ignored.
   */
  type?: DialogType | ResponsiveValue<DialogType>

  /**
   * The width of the dialog.
   * small: 296px
   * medium: 320px
   * large: 480px
   * xlarge: 640px
   */
  width?: DialogWidth

  /**
   * The height of the dialog.
   * small: 296x480
   * large: 480x640
   * auto: variable based on contents
   */
  height?: DialogHeight
}

/**
 * Props that are passed to a component that serves as a dialog header
 */
export interface DialogHeaderProps extends DialogProps {
  /**
   * ID of the element that will be used as the `aria-labelledby` attribute on the
   * dialog. This ID should be set to the element that renders the dialog's title.
   */
  dialogLabelId: string

  /**
   * ID of the element that will be used as the `aria-describedby` attribute on the
   * dialog. This ID should be set to the element that renders the dialog's subtitle.
   */
  dialogDescriptionId: string
}

const heightMap = {
  small: '480px',
  large: '640px',
  auto: 'auto',
} as const

const widthMap = {
  small: '296px',
  medium: '320px',
  large: '480px',
  xlarge: '640px',
} as const

export type DialogWidth = keyof typeof widthMap
export type DialogHeight = keyof typeof heightMap
export type DialogType = 'default' | 'full-screen' | 'action-sheet'

type StyledDialogProps = {
  width?: DialogWidth
  height?: DialogHeight
} & SxProp

const DefaultHeader: React.FC<React.PropsWithChildren<DialogHeaderProps>> = ({
  dialogLabelId,
  title,
  subtitle,
  dialogDescriptionId,
  onClose,
}) => {
  const onCloseClick = useCallback(() => {
    onClose('close-button')
  }, [onClose])
  return (
    <Dialog.Header>
      <Box display="flex">
        <Box display="flex" px={2} py="6px" flexDirection="column" flexGrow={1}>
          <Dialog.Title id={dialogLabelId}>{title ?? 'Dialog'}</Dialog.Title>
          {subtitle && <Dialog.Subtitle id={dialogDescriptionId}>{subtitle}</Dialog.Subtitle>}
        </Box>
        <Dialog.CloseButton onClose={onCloseClick} />
      </Box>
    </Dialog.Header>
  )
}
const DefaultBody: React.FC<React.PropsWithChildren<DialogProps>> = ({children}) => {
  return <Dialog.Body>{children}</Dialog.Body>
}
const DefaultFooter: React.FC<React.PropsWithChildren<DialogProps>> = ({footerButtons}) => {
  const {containerRef: footerRef} = useFocusZone({
    bindKeys: FocusKeys.ArrowHorizontal | FocusKeys.Tab,
    focusInStrategy: 'closest',
  })
  return footerButtons ? (
    <Dialog.Footer ref={footerRef as React.RefObject<HTMLDivElement>}>
      <Dialog.Buttons buttons={footerButtons} />
    </Dialog.Footer>
  ) : null
}

const _Dialog = React.forwardRef<HTMLDivElement, React.PropsWithChildren<DialogProps>>((props, forwardedRef) => {
  const {
    title = 'Dialog',
    subtitle = '',
    renderHeader,
    renderBody,
    renderFooter,
    onClose,
    role = 'dialog',
    width = 'xlarge',
    height = 'auto',
    type = 'default',
    footerButtons = [],
    sx,
  } = props
  const dialogLabelId = useId()
  const dialogDescriptionId = useId()
  const autoFocusedFooterButtonRef = useRef<HTMLButtonElement>(null)
  for (const footerButton of footerButtons) {
    if (footerButton.autoFocus) {
      footerButton.ref = autoFocusedFooterButtonRef
    }
  }
  const defaultedProps = {...props, title, subtitle, role, dialogLabelId, dialogDescriptionId}
  const responsiveType = useResponsiveValue(type, 'default')

  const dialogRef = useRef<HTMLDivElement>(null)
  useRefObjectAsForwardedRef(forwardedRef, dialogRef)
  useFocusTrap({containerRef: dialogRef, restoreFocusOnCleanUp: true, initialFocusRef: autoFocusedFooterButtonRef})

  useOnEscapePress(
    (event: KeyboardEvent) => {
      onClose('escape')
      event.preventDefault()
    },
    [onClose],
  )

  React.useEffect(() => {
    const bodyOverflowStyle = document.body.style.overflow || ''
    // If the body is already set to overflow: hidden, it likely means
    // that there is already a modal open. In that case, we should bail
    // so we don't re-enable scroll after the second dialog is closed.
    if (bodyOverflowStyle === 'hidden') {
      return
    }

    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = bodyOverflowStyle
    }
  }, [])

  const header = (renderHeader ?? DefaultHeader)(defaultedProps)
  const body = (renderBody ?? DefaultBody)(defaultedProps)
  const footer = (renderFooter ?? DefaultFooter)(defaultedProps)

  if (responsiveType === 'full-screen') {
    return (
      <Portal>
        <FullScreenDialog ref={dialogRef} role={role} aria-modal sx={sx}>
          {header}
          {body}
          {footer}
        </FullScreenDialog>
      </Portal>
    )
  }

  if (responsiveType === 'action-sheet') {
    return (
      <Portal>
        <DialogActionSheet ref={dialogRef} role={role} aria-modal onClose={onClose} sx={sx}>
          {header}
          {body}
          {footer}
        </DialogActionSheet>
      </Portal>
    )
  }

  return (
    <Portal>
      <Backdrop>
        <NormalDialog width={width} height={height} ref={dialogRef} sx={sx}>
          {header}
          {body}
          {footer}
        </NormalDialog>
      </Backdrop>
    </Portal>
  )
})
_Dialog.displayName = 'Dialog'

const buttonTypes = {
  normal: Button,
  primary: ButtonPrimary,
  danger: ButtonDanger,
}
const Buttons: React.FC<React.PropsWithChildren<{buttons: DialogButtonProps[]}>> = ({buttons}) => {
  const autoFocusRef = useProvidedRefOrCreate<HTMLButtonElement>(buttons.find(button => button.autoFocus)?.ref)
  let autoFocusCount = 0
  const [hasRendered, setHasRendered] = useState(0)
  useEffect(() => {
    // hack to work around dialogs originating from other focus traps.
    if (hasRendered === 1) {
      autoFocusRef.current?.focus()
    } else {
      setHasRendered(hasRendered + 1)
    }
  }, [autoFocusRef, hasRendered])

  return (
    <>
      {buttons.map((dialogButtonProps, index) => {
        const {content, buttonType = 'normal', autoFocus = false, ...buttonProps} = dialogButtonProps
        const ButtonElement = buttonTypes[buttonType]
        return (
          <ButtonElement
            key={index}
            {...buttonProps}
            variant={buttonType}
            ref={autoFocus && autoFocusCount === 0 ? (autoFocusCount++, autoFocusRef) : null}
          >
            {content}
          </ButtonElement>
        )
      })}
    </>
  )
}

/**
 * Styled wrappers
 */

const Backdrop = styled('div')`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${get('colors.primer.canvas.backdrop')};
  animation: dialog-backdrop-appear ${ANIMATION_DURATION} ${get('animation.easeOutCubic')};

  @keyframes dialog-backdrop-appear {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`

const NormalDialog = styled.div<StyledDialogProps>`
  display: flex;
  flex-direction: column;
  background-color: ${get('colors.canvas.overlay')};
  box-shadow: ${get('shadows.overlay.shadow')};
  min-width: 296px;
  max-width: calc(100vw - 64px);
  max-height: calc(100vh - 64px);
  width: ${props => widthMap[props.width ?? ('xlarge' as const)]};
  height: ${props => heightMap[props.height ?? ('auto' as const)]};
  border-radius: 12px;
  opacity: 1;
  animation: overlay--dialog-appear ${ANIMATION_DURATION} ${get('animation.easeOutCubic')};

  @keyframes overlay--dialog-appear {
    0% {
      opacity: 0;
      transform: scale(0.5);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  ${sx};
`

const FullScreenDialog = styled.div<StyledDialogProps>`
  display: flex;
  flex-direction: column;
  background-color: ${get('colors.canvas.overlay')};
  width: 100vw;
  height: 100vh;
  opacity: 1;
  animation: overlay--dialog-appear ${ANIMATION_DURATION} ${get('animation.easeOutCubic')};
  @keyframes overlay--dialog-appear {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
  ${sx};
`

const Header = styled.div<SxProp>`
  box-shadow: 0 1px 0 ${get('colors.border.default')};
  padding: ${get('space.2')};
  z-index: 1;
  flex-shrink: 0;
`

const Title = styled.h1<SxProp>`
  font-size: ${get('fontSizes.1')};
  font-weight: ${get('fontWeights.bold')};
  margin: 0; /* override default margin */
  ${sx};
`

const Subtitle = styled.h2<SxProp>`
  font-size: ${get('fontSizes.0')};
  font-weight: ${get('fontWeights.normal')};
  color: ${get('colors.fg.muted')};
  margin: 0; /* override default margin */
  margin-top: ${get('space.1')};

  ${sx};
`

const Body = styled.div<SxProp>`
  flex-grow: 1;
  overflow: auto;
  padding: ${get('space.3')};

  ${sx};
`

const Footer = styled.div<SxProp>`
  box-shadow: 0 -1px 0 ${get('colors.border.default')};
  padding: ${get('space.3')};
  display: flex;
  flex-flow: wrap;
  justify-content: flex-end;
  gap: ${get('space.2')};
  z-index: 1;
  flex-shrink: 0;

  ${sx};
`

const DialogCloseButton = styled(Button)`
  border-radius: 4px;
  background: transparent;
  border: 0;
  vertical-align: middle;
  color: ${get('colors.fg.muted')};
  padding: ${get('space.2')};
  align-self: flex-start;
  line-height: normal;
  box-shadow: none;
`

const CloseButton: React.FC<React.PropsWithChildren<{onClose: () => void}>> = ({onClose}) => {
  return (
    <DialogCloseButton aria-label="Close" onClick={onClose}>
      <Octicon icon={XIcon} />
    </DialogCloseButton>
  )
}

/**
 * A dialog is a type of overlay that can be used for confirming actions, asking
 * for disambiguation, and presenting small forms. They generally allow the user
 * to focus on a quick task without having to navigate to a different page.
 *
 * Dialogs appear in the page after a direct user interaction. Don't show dialogs
 * on page load or as system alerts.
 *
 * Dialogs appear centered in the page, with a visible backdrop that dims the rest
 * of the window for focus.
 *
 * All dialogs have a title and a close button.
 *
 * Dialogs are modal. Dialogs can be dismissed by clicking on the close button,
 * pressing the escape key, or by interacting with another button in the dialog.
 * To avoid losing information and missing important messages, clicking outside
 * of the dialog will not close it.
 *
 * The sub components provided (e.g. Header, Title, etc.) are available for custom
 * renderers only. They are not intended to be used otherwise.
 */
export const Dialog = Object.assign(_Dialog, {
  Header,
  Title,
  Subtitle,
  Body,
  Footer,
  Buttons,
  CloseButton,
})
