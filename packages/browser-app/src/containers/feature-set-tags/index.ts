import { connect } from 'react-redux';
import { DispatchPropsType, OwnPropsType, StatePropsType } from './types';
import { MapDispatchToProps, MapStateToProps } from '../../domain/types';
import { setTags } from '../../domain/feature/actions';
import Organism from './organism'
import hasSideEffect from '../../has-side-effect';
import Loading from '../../components/loading';
import { selectFeature } from '../../domain/feature/selectors';
import { whereRevisions } from '../../domain/revision/actions';
import { whereTags } from '../../domain/tags/actions';
import { selectTags } from '../../domain/tags/selectors';

const mapStateToProps: MapStateToProps<StatePropsType, OwnPropsType> = (state, props) => ({
  tags: selectTags(state),
  feature: selectFeature(state, props.featureId)
})

const mapDispatchToProps: MapDispatchToProps<DispatchPropsType, OwnPropsType> = (dispatch, props) => ({
  sideEffect: async () => {
    await Promise.all([
      dispatch(whereRevisions({ featureId: props.featureId })),
      dispatch(whereTags({}))
    ])
  },
  onSubmit: async (tags) => {
    await setTags({
      featureId: props.featureId,
      tags: [{
        id: '540b085d-b6e3-43cb-9cd0-613da07e9b5e',
        name: 'Hallo',
        color: '#ff21dd'
      }]
    })
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(hasSideEffect({
  LoadingComponent: Loading
})(Organism))