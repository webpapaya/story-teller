import React from 'react';
import { OrganismPropsType } from '../types';
import {
  ExitToApp
} from '@material-ui/icons';
import styles from './index.module.css'
import { css } from '../../../utils/css';
import ProjectSelection from './project-selection';

const Organism = (props: OrganismPropsType) => (
  <nav className={css(styles.navigationWrp)}>
    <ProjectSelection
      onProjectsSelected={props.onProjectsSelected}
      projects={props.projects}
      activeProjects={props.activeProjects}
    />
    <ExitToApp onClick={() => props.onSignOut({})} aria-label='sign out' />
  </nav>
)

export default Organism