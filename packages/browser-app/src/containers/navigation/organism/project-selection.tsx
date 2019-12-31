import React, { useState } from 'react';
import { OrganismPropsType } from '../types';
import {Button} from '../../../components/button'
import styles from './project-selection.module.css'
import { css } from '../../../utils/css';
import { Link } from '../../../components/link';
import { useTranslations } from './translations'

const ProjectSelection = (props: Pick<OrganismPropsType, 'activeProjects' | 'projects' | 'onProjectsSelected'>) => {
  const detailsRef = React.createRef<HTMLElement>()
  const { t } = useTranslations()
  const closeDetails = () => detailsRef.current!.removeAttribute('open')

  return (
    <details ref={detailsRef}>
      <summary className={css(styles.selectedProjects)}>
        {
          props.projects
            .filter((p) => props.activeProjects.includes(p.id))
            .map((p) => p.name)
            .join(', ')
        }
      </summary>

      <section className={css(styles.projectSelection)}>
        { props.projects.map((project) => (
          <Link
            onClick={closeDetails}
            variant="link"
            to={`/project/${project.id}`}
          >{project.name}</Link>
        ))}
        <Link
          onClick={closeDetails}
          variant="link"
          to="/project/create"
        >{t('createProject')}</Link>
        </section>
    </details>
  )
}

export default ProjectSelection