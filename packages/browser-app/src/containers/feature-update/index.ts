import { connect } from 'react-redux';
import { DispatchPropsType, OwnPropsType, StatePropsType } from './types';
import { MapDispatchToProps, MapStateToProps } from '../../domain/types';
import { createFeature, whereFeature } from '../../domain/feature/actions';
import Organism from './organism'
import hasSideEffect from '../../has-side-effect';
import Loading from '../../components/loading';

const mapStateToProps: MapStateToProps<StatePropsType, OwnPropsType> = (state, props) => ({
  defaultValues: state.features.find((feature) => feature.id === props.id)
})

const mapDispatchToProps: MapDispatchToProps<DispatchPropsType, OwnPropsType> = (dispatch) => ({
  sideEffect: () => dispatch(whereFeature({})),
  onSubmit: (args) => dispatch(createFeature(args))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(hasSideEffect({
  LoadingComponent: Loading
})(Organism))