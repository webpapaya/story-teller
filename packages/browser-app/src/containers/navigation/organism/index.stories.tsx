import React from 'react';
import { action } from '@storybook/addon-actions'
import { storiesOf } from '../../../storybook';
import Organism from '../organism';
import uuid from 'uuid';

const projects = [
  { id: uuid(), name: 'Project A' },
  { id: uuid(), name: 'Project B' },
  { id: uuid(), name: 'Project C' }
]

storiesOf('Navigation', module)
  .add('default', () => (
    <Organism
      // @ts-ignore
      onSignOut={action('onSubmit')}
      // @ts-ignore
      onProjectsSelected={action('onProjectsSelected')}
      activeProjects={[projects[0].id, projects[2].id]}
      projects={projects}
    />
  ))

