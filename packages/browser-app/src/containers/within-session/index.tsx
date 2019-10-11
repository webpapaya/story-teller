import { connect } from 'react-redux';
import { MapDispatchToProps, MapStateToProps } from '../../domain/types';
import { getAuthenticatedUser, signIn } from '../../domain/authentication/actions';
import { DispatchPropsType, StatePropsType, OwnPropsType } from './types'
import hasSideEffect from '../../has-side-effect';
import Organism from './organism';

const mapStateToProps: MapStateToProps<OwnPropsType, StatePropsType> = () => ({})

const mapDispatchToProps: MapDispatchToProps<DispatchPropsType> = (dispatch) => ({
  sideEffect: () => dispatch(getAuthenticatedUser({}))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(hasSideEffect({})(Organism))