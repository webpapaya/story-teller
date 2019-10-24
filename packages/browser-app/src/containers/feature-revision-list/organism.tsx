import React from 'react';
import Badge from '../../components/badge';
import { OrganismPropsType } from './types';

const Organism = (props: OrganismPropsType) => {
  return (
    <>
      { props.revision.map((revision) => (
        <Badge key={revision.id} title={revision.reason}/>
      ))}
    </>
  )
}

export default Organism