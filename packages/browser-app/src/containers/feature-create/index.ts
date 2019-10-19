import { connect } from 'react-redux';
import { DispatchPropsType, OwnPropsType } from './types';
import { MapDispatchToProps } from '../../domain/types';
import { createFeature } from '../../domain/feature/actions';
import Organism from './organism'

const mapDispatchToProps: MapDispatchToProps<DispatchPropsType, OwnPropsType> = (dispatch) => ({
  onSubmit: async (values) => {
    await dispatch(createFeature(values))
  }
})

export default connect(null, mapDispatchToProps)(Organism)