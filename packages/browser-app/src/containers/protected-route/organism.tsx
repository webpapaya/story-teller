import React, { useEffect } from 'react'
import { Route, Redirect } from 'react-router-dom'
import { OrganismPropsType } from './types'
import Loading from '../../components/loading'

const Organism = ({ isAuthenticated, isLoading, refreshToken, ...props }: OrganismPropsType) => {
  useEffect(() => {
    const intervalId = setInterval(() => refreshToken(), 10000)
    return () => clearInterval(intervalId)
  }, [])

  if (isAuthenticated) {
    return <Route {...props} />
  } else if (isLoading) {
    return <Loading />
  } else {
    return <Redirect to='/sign-in' />
  }
}

export default Organism
