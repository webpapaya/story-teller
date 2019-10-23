import { connect } from 'react-redux';
import { DispatchPropsType, OwnPropsType, StatePropsType } from './types';
import { MapDispatchToProps, MapStateToProps } from '../../domain/types';
import { whereFeature, createFeatureRevision } from '../../domain/feature/actions';
import Organism from './organism'
import hasSideEffect from '../../has-side-effect';
import Loading from '../../components/loading';
import { selectFeature } from '../../domain/feature/selectors';
import { whereRevisions } from '../../domain/revision/actions';

const mapStateToProps: MapStateToProps<StatePropsType, OwnPropsType> = (state, props) => ({
  defaultValues: selectFeature(state, props.id)
})

const mapDispatchToProps: MapDispatchToProps<DispatchPropsType, OwnPropsType> = (dispatch, props) => ({
  sideEffect: async () => {
    await Promise.all([
      dispatch(whereFeature({ id: props.id })),
      dispatch(whereRevisions({ featureId: props.id }))
    ])
  },
  onSubmit: async (args) => {
    await dispatch(createFeatureRevision(args))
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(hasSideEffect({
  LoadingComponent: Loading
})(Organism))