import { connect } from 'react-redux';
import { DispatchPropsType, OwnPropsType, StatePropsType } from './types';
import { MapDispatchToProps, MapStateToProps } from '../../domain/types';
import { whereFeature, createFeatureRevision } from '../../domain/feature/actions';
import Organism from './organism'
import hasSideEffect from '../../has-side-effect';
import Loading from '../../components/loading';

const mapStateToProps: MapStateToProps<StatePropsType, OwnPropsType> = (state, props) => ({
  defaultValues: state.features.find((feature) => feature.id === props.id)
})

const mapDispatchToProps: MapDispatchToProps<DispatchPropsType, OwnPropsType> = (dispatch, props) => ({
  sideEffect: () => dispatch(whereFeature({})),
  onSubmit: async (args) => {
    await dispatch(createFeatureRevision(args))
    props.history.replace(`/feature/${args.id}`)
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(hasSideEffect({
  LoadingComponent: Loading
})(Organism))