import React from 'react'
import {Meta} from '@storybook/react'
import {Button, IconButton, Box} from '..'
import Label from '../Label'
import {GitBranchIcon, PencilIcon, SidebarExpandIcon} from '@primer/octicons-react'

import {PageHeader} from './PageHeader'

export default {
  title: 'Drafts/Components/PageHeader/DevOnly',
  parameters: {
    layout: 'fullscreen',
    controls: {expanded: true},
  },
} as Meta

export const LargeVariantWithMultilineTitle = () => (
  <Box sx={{padding: 3}}>
    <PageHeader>
      <PageHeader.LeadingAction>
        <IconButton aria-label="Edit" icon={PencilIcon} variant="invisible" />
      </PageHeader.LeadingAction>
      <PageHeader.TitleArea variant="large">
        <PageHeader.LeadingVisual>
          <GitBranchIcon />
        </PageHeader.LeadingVisual>
        <PageHeader.Title>
          Title long title some extra loooong looong words here some extra loooong looong words here some extra loooong
          looong words here some extra loooong looong words here some extra loooong looong words here
        </PageHeader.Title>
        <PageHeader.TrailingVisual>
          <Label>Beta</Label>
        </PageHeader.TrailingVisual>
      </PageHeader.TitleArea>
      <PageHeader.TrailingAction>
        <IconButton aria-label="Expand sidebar" icon={SidebarExpandIcon} variant="invisible" />
      </PageHeader.TrailingAction>
      <PageHeader.Actions>
        <Button variant="primary">Add Item</Button>
      </PageHeader.Actions>
    </PageHeader>
  </Box>
)
