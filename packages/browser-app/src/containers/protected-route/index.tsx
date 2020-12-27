import { connect } from 'react-redux';
import { MapDispatchToProps, MapStateToProps } from '../../domain/types';
import { getAuthenticatedUser } from '../../domain/authentication/actions';
import { DispatchPropsType, StatePropsType, OwnPropsType } from './types'
import hasSideEffect from '../../has-side-effect';
import Organism from './organism';

const mapStateToProps: MapStateToProps<StatePropsType, OwnPropsType> = (state) => ({
  isAuthenticated: state.authentication.state === 'authenticated',
  isLoading: false,
})

const mapDispatchToProps: MapDispatchToProps<DispatchPropsType, OwnPropsType> = (dispatch) => ({
  sideEffect: () => dispatch(getAuthenticatedUser({}))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(hasSideEffect({})(Organism))