import React from 'react';
import { OrganismPropsType } from './types';
import {
  ExitToApp
} from '@material-ui/icons';
import styles from './organism.module.css'
import { css } from '../../utils/css';

const Organism = (props: OrganismPropsType) => {
  const x = React.createRef<HTMLInputElement>()
  return (
    <input
      ref={x}
      className={css(
        styles.input
      )}
      type="checkbox"
      name="sepp"
      value={props.projects[0].id}
      onChange={() => {
        throw new Error('hallo')
        console.log('hallo')
      }}
    />

  )
  return (
    <nav className={css(styles.navigationWrp)}>
      {/* <details> */}
        {/* <summary className={css(styles.selectedProjects)}>
          {
            props.projects
              .filter((p) => props.selectedProjects.includes(p.id))
              .map((p) => p.name)
              .join(', ')
          }
        </summary>

          <form>
        <fieldset className={css(styles.projectSelection)}> */}
          { props.projects.map((project) => (
            <label
              className={styles.projectLabel}
              key={project.id}
            >
              <input
                type="text"
                // name={project.name}
                // checked={props.selectedProjects.includes(project.id)}
                value={project.id}
                onChange={() => {
                  console.log('hallo')
                }}
                // onChange={(e) => {

                //   // console.log(e.target.checked)
                //   // props.onProjectsSelected([ project.id ])
                // }}
              />
              { project.name}
            </label>
          ))}
        {/* </fieldset>
        </form>
      </details> */}

      <ExitToApp onClick={() => props.onSignOut({})} aria-label='sign out' />
    </nav>
  )
}

export default Organism