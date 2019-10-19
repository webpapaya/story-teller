import { connect } from 'react-redux';
import { DispatchPropsType, OwnPropsType } from './types';
import { MapDispatchToProps } from '../../domain/types';
import { createFeature, whereFeature } from '../../domain/feature/actions';
import Organism from './organism'

const mapDispatchToProps: MapDispatchToProps<DispatchPropsType, OwnPropsType> = (dispatch, props) => ({
  onSubmit: async (values) => {
    await dispatch(createFeature(values))
  }
})

export default connect(null, mapDispatchToProps)(Organism)