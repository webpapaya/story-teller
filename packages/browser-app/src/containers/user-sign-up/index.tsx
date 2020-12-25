import { connect } from 'react-redux';
import { DispatchPropsType, OwnPropsType } from './types';
import { MapDispatchToProps } from '../../domain/types';
import { signUp } from '../../domain/authentication/actions';
import Organism from './organism'

const mapDispatchToProps: MapDispatchToProps<DispatchPropsType, OwnPropsType> = (dispatch, props) => ({
  onSubmit: async (values) => {
    await dispatch(signUp(values))
    props.history.push('/sign-in')
  }
})

export default connect(null, mapDispatchToProps)(Organism)