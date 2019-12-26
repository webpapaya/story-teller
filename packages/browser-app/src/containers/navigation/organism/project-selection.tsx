import React from 'react';
import { OrganismPropsType } from '../types';
import styles from './project-selection.module.css'
import { css } from '../../../utils/css';

const ProjectSelection = (props: Pick<OrganismPropsType, 'activeProjects' | 'projects' | 'onProjectsSelected'>) => (
  <details>
    <summary className={css(styles.selectedProjects)}>
      {
        props.projects
          .filter((p) => props.activeProjects.includes(p.id))
          .map((p) => p.name)
          .join(', ')
      }
    </summary>

    <fieldset className={css(styles.projectSelection)}>
      { props.projects.map((project) => (
        <label
          className={styles.projectLabel}
          key={project.id}
        >
          <input
            type="checkbox"
            name={project.name}
            checked={props.activeProjects.includes(project.id)}
            value={project.id}
            onChange={(e) => {
              const nextSelectedProjects = e.target.checked
                ? [ ...props.activeProjects, project.id ]
                : props.activeProjects.filter((projectId) => projectId !== project.id)

              props.onProjectsSelected(nextSelectedProjects)
            }}
          />
          { project.name}
        </label>
      ))}
    </fieldset>
  </details>
)

export default ProjectSelection