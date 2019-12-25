import React from 'react';
import { OrganismPropsType } from './types';
import {
  ExitToApp
} from '@material-ui/icons';
import styles from './organism.module.css'
import { css } from '../../utils/css';

const Organism = (props: OrganismPropsType) => {
  return (
    <nav className={css(styles.navigationWrp)}>
      <details>
        <summary className={css(styles.selectedProjects)}>
          {
            props.projects
              .filter((p) => props.selectedProjects.includes(p.id))
              .map((p) => p.name)
              .join(', ')
          }
        </summary>

          <form>
        <fieldset className={css(styles.projectSelection)}>
          { props.projects.map((project) => (
            <label
              className={styles.projectLabel}
              key={project.id}
            >
              <input
                type="text"
                name={project.name}
                checked={props.selectedProjects.includes(project.id)}
                value={project.id}
                onChange={(e) => {
                  const nextSelectedProjects = e.target.checked
                    ? [ ...props.selectedProjects, project.id ]
                    : props.selectedProjects.filter((projectId) => projectId !== project.id)

                  props.onProjectsSelected(nextSelectedProjects)
                }}
              />
              { project.name}
            </label>
          ))}
        </fieldset>
        </form>
      </details>

      <ExitToApp onClick={() => props.onSignOut({})} aria-label='sign out' />
    </nav>
  )
}

export default Organism