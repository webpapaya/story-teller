import React from 'react';
import Badge from '../../components/badge';
import { OrganismPropsType } from './types';

const Organism = (props: OrganismPropsType) => {
  return (
    <>
      { props.projects.map((project) => (
        <Badge key={project.id} title={project.name}/>
      ))}
    </>
  )
}

export default Organism