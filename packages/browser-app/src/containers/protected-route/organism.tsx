import React from 'react';
import { Route, Redirect } from 'react-router-dom'
import { OrganismPropsType } from "./types";
import Loading from '../../components/loading';

const Organism = ({ isAuthenticated, isLoading, ...props }: OrganismPropsType) => {
  if (isAuthenticated) {
    return <Route {...props} />
  } else if (isLoading) {
    return <Loading />
  } else {
    return <Redirect to='/' />
  }
}

export default Organism
