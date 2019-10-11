import { connect } from 'react-redux';
import { DispatchPropsType } from './types';
import { MapDispatchToProps } from '../../domain/types';
import Organism from './organism'
import { signUp } from '../../domain/authentication/actions';

const mapDispatchToProps: MapDispatchToProps<DispatchPropsType> = (dispatch) => {
  return {
    onSubmit: (values) => dispatch(signUp(values))
  }
}

export default connect(null, mapDispatchToProps)(Organism)