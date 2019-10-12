import { connect } from 'react-redux';
import { DispatchPropsType, OwnPropsType } from './types';
import { MapDispatchToProps } from '../../domain/types';
import Organism from './organism'
import { signOut } from '../../domain/authentication/actions';
import {  } from '../user-sign-in/types';

const mapDispatchToProps: MapDispatchToProps<DispatchPropsType, OwnPropsType> = (dispatch) => {
  return {
    onSignOut: () => dispatch(signOut({}))
  }
}

export default connect(null, mapDispatchToProps)(Organism)