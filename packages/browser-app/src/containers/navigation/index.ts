import { connect } from 'react-redux'
import { DispatchPropsType, OwnPropsType, StatePropsType } from './types'
import { MapDispatchToProps, MapStateToProps } from '../../domain/types'
import Organism from './organism'
import { signOut } from '../../domain/authentication/actions'
import hasSideEffect from '../../has-side-effect'
import { withRouter } from 'react-router'

const mapStateToProps: MapStateToProps<StatePropsType, OwnPropsType> = () => {
  return ({})
}

const mapDispatchToProps: MapDispatchToProps<DispatchPropsType, OwnPropsType> = (dispatch, props) => {
  return {
    sideEffect: () => Promise.resolve(),
    onSignOut: () => dispatch(signOut())
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(hasSideEffect({})(Organism)))
