import {SearchIcon} from '@primer/octicons-react'
import {render, screen, fireEvent} from '@testing-library/react'
import {axe} from 'jest-axe'
import React from 'react'
import {IconButton, Button, ButtonProps} from '../../Button'
import {behavesAsComponent} from '../../utils/testing'

type StatefulLoadingButtonProps = {
  children?: React.ReactNode
  id?: string
  ['aria-describedby']?: string
  loadingAnnouncement?: string
}

const TestButton = (props: ButtonProps) => <Button id="test-button" {...props} />

const StatefulLoadingButton = (props: StatefulLoadingButtonProps) => {
  const [isLoading, setIsLoading] = React.useState(false)
  const handleClick = () => {
    setIsLoading(true)
  }

  return <Button loading={isLoading} onClick={handleClick} {...props} />
}

describe('Button', () => {
  behavesAsComponent({
    Component: TestButton,
    options: {skipSx: true, skipAs: true},
  })

  it('renders a <button>', () => {
    const container = render(<Button id="test-button">Default</Button>)
    const button = container.getByRole('button')
    expect(button.textContent).toEqual('Default')
  })

  it('should have no axe violations', async () => {
    const {container} = render(<Button>Click here</Button>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('preserves "onClick" prop', () => {
    const onClick = jest.fn()
    const container = render(<Button onClick={onClick}>Noop</Button>)
    const button = container.getByRole('button')
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('respects block prop', () => {
    const container = render(
      <Button block id="test-button">
        Block
      </Button>,
    )
    const button = container.getByRole('button')
    expect(button).toMatchSnapshot()
  })

  it('respects the "disabled" prop', () => {
    const onClick = jest.fn()
    const container = render(
      <Button onClick={onClick} disabled>
        Disabled
      </Button>,
    )
    const button = container.getByRole('button')
    expect(button.hasAttribute('disabled')).toEqual(true)
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(0)
  })

  it('respects the small size prop', () => {
    const container = render(
      <Button size="small" id="test-button">
        Smol
      </Button>,
    )
    const button = container.getByRole('button')
    expect(button).toMatchSnapshot()
  })

  it('respects the large size prop', () => {
    const container = render(
      <Button size="large" id="test-button">
        Smol
      </Button>,
    )
    const button = container.getByRole('button')
    expect(button).toMatchSnapshot()
  })

  it('styles primary button appropriately', () => {
    const container = render(
      <Button variant="primary" id="test-button">
        Primary
      </Button>,
    )
    const button = container.getByRole('button')
    expect(button).toMatchSnapshot()
  })

  it('styles invisible button appropriately', () => {
    const container = render(
      <Button variant="invisible" id="test-button">
        Invisible
      </Button>,
    )
    const button = container.getByRole('button')
    expect(button).toMatchSnapshot()
  })

  it('styles danger button appropriately', () => {
    const container = render(
      <Button variant="danger" id="test-button">
        Danger
      </Button>,
    )
    const button = container.getByRole('button')
    expect(button).toMatchSnapshot()
  })

  it('makes sure icon button has an aria-label', () => {
    const container = render(<IconButton icon={SearchIcon} aria-label="Search button" />)
    const IconOnlyButton = container.getByLabelText('Search button')
    expect(IconOnlyButton).toBeTruthy()
  })

  it('respects the alignContent prop', () => {
    const container = render(
      <Button alignContent="start" id="test-button">
        Align start
      </Button>,
    )
    const button = container.getByRole('button')
    expect(button).toMatchSnapshot()
  })

  it('should render the leadingVisual prop before the button content', () => {
    render(
      <Button leadingVisual={() => <span data-testid="leadingVisual" />}>
        <span>content</span>
      </Button>,
    )

    expect(screen.getByTestId('leadingVisual')).toBeInTheDocument()

    const position = screen.getByText('content').compareDocumentPosition(screen.getByTestId('leadingVisual'))
    expect(position).toBe(Node.DOCUMENT_POSITION_PRECEDING)
  })

  it('should render the trailingVisual prop after the button content', () => {
    render(
      <Button trailingVisual={() => <span data-testid="trailingVisual" />}>
        <span>content</span>
      </Button>,
    )
    expect(screen.getByTestId('trailingVisual')).toBeInTheDocument()

    const position = screen.getByText('content').compareDocumentPosition(screen.getByTestId('trailingVisual'))
    expect(position).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })

  it('should describe the button with a default loading announcement, and only when the button is in a loading state', () => {
    const buttonId = 'loading-button'
    const container = render(
      <StatefulLoadingButton id={buttonId}>
        <span>content</span>
      </StatefulLoadingButton>,
    )
    const buttonNode = container.getByRole('button')

    expect(buttonNode.getAttribute('aria-describedby')).toBe(`${buttonId}-loading-announcement`)

    expect(buttonNode).not.toHaveAccessibleDescription('Loading')

    fireEvent.click(buttonNode)

    expect(buttonNode).toHaveAccessibleDescription('Loading')
  })

  it('should render a custom loading announcement, and only when the button is in a loading state', () => {
    const buttonId = 'loading-button'
    const container = render(
      <StatefulLoadingButton id={buttonId} loadingAnnouncement="Action loading">
        <span>content</span>
      </StatefulLoadingButton>,
    )
    const buttonNode = container.getByRole('button')

    expect(buttonNode.getAttribute('aria-describedby')).toBe(`${buttonId}-loading-announcement`)

    expect(buttonNode).not.toHaveAccessibleDescription('Action loading')

    fireEvent.click(buttonNode)

    expect(buttonNode).toHaveAccessibleDescription('Action loading')
  })

  it('should be described by loading announcement AND whatever is passed to aria-describedby', () => {
    const buttonDescriptionId = 'button-description'
    const buttonId = 'loading-button'
    const container = render(
      <StatefulLoadingButton id={buttonId} aria-describedby={buttonDescriptionId}>
        <span>content</span>
      </StatefulLoadingButton>,
    )
    const buttonDescribedBy = container.getByRole('button').getAttribute('aria-describedby')
    const loadingAnnouncementId = `${buttonId}-loading-announcement`

    expect(buttonDescribedBy).toContain(loadingAnnouncementId)

    expect(buttonDescribedBy).toContain(buttonDescriptionId)
  })

  it('should only set aria-disabled to "true" when the button is in a loading state', () => {
    const container = render(
      <StatefulLoadingButton>
        <span>content</span>
      </StatefulLoadingButton>,
    )
    const buttonNode = container.getByRole('button')

    expect(buttonNode.getAttribute('aria-disabled')).not.toBe('true')

    fireEvent.click(buttonNode)

    expect(buttonNode.getAttribute('aria-disabled')).toBe('true')
  })

  it('should preserve the accessible button name when the button is in a loading state', () => {
    const container = render(<Button loading>content</Button>)

    expect(container.getByRole('button')).toHaveAccessibleName('content')
  })
})
