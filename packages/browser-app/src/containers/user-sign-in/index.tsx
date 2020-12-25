import { connect } from 'react-redux';
import { DispatchPropsType, OwnPropsType } from './types';
import { MapDispatchToProps } from '../../domain/types';
import Organism from './organism'
import { signIn } from '../../domain/authentication/actions';

const mapDispatchToProps: MapDispatchToProps<DispatchPropsType, OwnPropsType> = (dispatch, props) => ({
  onSubmit: async (values) => {
    await dispatch(signIn(values))
    props.history.push('/app')
  }
})

export default connect(null, mapDispatchToProps)(Organism)
