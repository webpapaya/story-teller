import React from 'react';
import { OrganismPropsType } from "./types";

const Organism = ({ children, isAuthenticated }: OrganismPropsType) => {
  return isAuthenticated
    ? <>{children}</>
    : null
}

export default Organism
