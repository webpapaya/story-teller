import React from 'react';
import { OrganismPropsType } from './types';
import { Button } from '../../components/button';

const Organism = (props: OrganismPropsType) => {
  return <Button onClick={() => props.onSignOut({}) }>Sign out</Button>
}

export default Organism