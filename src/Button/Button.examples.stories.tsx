import React from 'react'
import type {Meta} from '@storybook/react'
import {Button} from '.'
import {DownloadIcon} from '@primer/octicons-react'
import Box from '../Box'
import {VisuallyHidden} from '../internal/components/VisuallyHidden'

const meta: Meta<typeof Button> = {
  title: 'Components/Button/Examples',
} as Meta<typeof Button>

export default meta

export const LoadingStatusAnnouncements = () => {
  const [loading, setLoading] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [error, setError] = React.useState(false)

  const resolveAction = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setLoading(false)

    return await true
  }

  const onClick = (resolveType: 'error' | 'success') => async () => {
    const actionResult = await resolveAction()

    if (resolveType === 'error') {
      setError(actionResult)
      setSuccess(!actionResult)
      return
    }

    setSuccess(actionResult)
    setError(!actionResult)
  }

  return (
    <>
      <VisuallyHidden aria-live="polite">
        {!loading && success ? 'Export completed' : null}
        {!loading && error ? 'Export failed' : null}
      </VisuallyHidden>
      <Box sx={{display: 'flex', gap: 3}}>
        <Button loading={loading} leadingVisual={DownloadIcon} onClick={onClick('success')}>
          Export (success)
        </Button>
        <Button loading={loading} leadingVisual={DownloadIcon} onClick={onClick('error')}>
          Export (error)
        </Button>
      </Box>
    </>
  )
}
