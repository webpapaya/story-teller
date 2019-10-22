import { connect } from 'react-redux';
import { DispatchPropsType, OwnPropsType, StatePropsType } from './types';
import { MapDispatchToProps, MapStateToProps } from '../../domain/types';
import { whereFeature, createFeatureRevision, whereFeatureRevisions } from '../../domain/feature/actions';
import Organism from './organism'
import hasSideEffect from '../../has-side-effect';
import Loading from '../../components/loading';
import { selectFeature } from '../../domain/feature/selectors';

const mapStateToProps: MapStateToProps<StatePropsType, OwnPropsType> = (state, props) => ({
  defaultValues: selectFeature(state, props.id)
})

const mapDispatchToProps: MapDispatchToProps<DispatchPropsType, OwnPropsType> = (dispatch, props) => ({
  sideEffect: () => dispatch(whereFeatureRevisions({ id: props.id })),
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