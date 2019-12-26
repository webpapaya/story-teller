import { connect } from 'react-redux'
import { DispatchPropsType, OwnPropsType, StatePropsType } from './types'
import { MapDispatchToProps, MapStateToProps } from '../../domain/types'
import Organism from './organism'
import { signOut } from '../../domain/authentication/actions'
import hasSideEffect from '../../has-side-effect'
import { whereProjects } from '../../domain/project/actions'
import { withRouter } from 'react-router'
import { selectActiveProjects, writeActiveProjects } from '../../domain/project/selectors'

const mapStateToProps: MapStateToProps<StatePropsType, OwnPropsType> = (state, props) => {
  return ({
    projects: state.projects,
    activeProjects: selectActiveProjects(props.history)
  })
}

const mapDispatchToProps: MapDispatchToProps<DispatchPropsType, OwnPropsType> = (dispatch, props) => {
  return {
    onProjectsSelected: (t) => writeActiveProjects(props.history, t),
    sideEffect: () => dispatch(whereProjects({})),
    onSignOut: () => dispatch(signOut({}))
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(hasSideEffect({})(Organism)))
