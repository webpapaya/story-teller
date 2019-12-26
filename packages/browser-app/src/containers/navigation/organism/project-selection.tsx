import React from 'react';
import { OrganismPropsType } from '../types';
import {Button} from '../../../components/button'
import styles from './project-selection.module.css'
import { css } from '../../../utils/css';
import { Link } from '../../../components/link';
import { useTranslations } from './translations'

const ProjectSelection = (props: Pick<OrganismPropsType, 'activeProjects' | 'projects' | 'onProjectsSelected'>) => {
  const { t } = useTranslations()
  return (
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
      <Link variant="link" to="/project/create">{t('createProject')}</Link>
    </fieldset>
  </details>
)
}

export default ProjectSelection