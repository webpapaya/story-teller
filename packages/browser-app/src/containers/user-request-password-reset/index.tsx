import { connect } from 'react-redux';
import { DispatchPropsType, OwnPropsType } from './types';
import { MapDispatchToProps } from '../../domain/types';
import Organism from './organism'
import { requestPasswordReset } from '../../domain/authentication/actions';

const mapDispatchToProps: MapDispatchToProps<DispatchPropsType, OwnPropsType> = (dispatch, props) => ({
  onSubmit: async (values) => {
    await dispatch(requestPasswordReset(values))
    props.history.push('/')
  }
})

export default connect(null, mapDispatchToProps)(Organism)
