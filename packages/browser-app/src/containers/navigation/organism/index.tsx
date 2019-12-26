import React, { useEffect } from 'react';
import { OrganismPropsType } from '../types';
import {
  ExitToApp
} from '@material-ui/icons';
import styles from './index.module.css'
import { css } from '../../../utils/css';
import ProjectSelection from './project-selection';

const Organism = (props: OrganismPropsType) => {
  const ref = React.createRef<HTMLDivElement>()
  useEffect(() => {
    const setHTMLPadding = () => {
      if (!ref.current) { return }
      const padding = ref.current.offsetHeight || 0
      document.querySelector("html")!.style.paddingTop = `${padding}px`
    }
    setHTMLPadding()
    window.addEventListener('resize', setHTMLPadding);
    return () => window.removeEventListener('resize', setHTMLPadding);
  }, [ref.current])

  return (
    <nav className={css(styles.navigationWrp)} ref={ref}>
      <ProjectSelection
        onProjectsSelected={props.onProjectsSelected}
        projects={props.projects}
        activeProjects={props.activeProjects}
      />
      <ExitToApp onClick={() => props.onSignOut({})} aria-label='sign out' />
    </nav>
  )
}

export default Organism