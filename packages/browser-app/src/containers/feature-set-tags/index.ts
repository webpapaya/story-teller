import { connect } from 'react-redux'
import { DispatchPropsType, OwnPropsType, StatePropsType } from './types'
import { MapDispatchToProps, MapStateToProps } from '../../domain/types'
import { setTags, whereFeature } from '../../domain/feature/actions'
import Organism from './organism'
import hasSideEffect from '../../has-side-effect'
import Loading from '../../components/loading'
import { selectFeature } from '../../domain/feature/selectors'
import { whereTags } from '../../domain/tags/actions'
import { selectTags } from '../../domain/tags/selectors'

const mapStateToProps: MapStateToProps<StatePropsType, OwnPropsType> = (state, props) => ({
  tags: selectTags(state),
  feature: selectFeature(state, props.featureId)
})

const mapDispatchToProps: MapDispatchToProps<DispatchPropsType, OwnPropsType> = (dispatch, props) => ({
  sideEffect: async () => {
    await Promise.all([
      dispatch(whereFeature({ featureId: props.featureId })),
      dispatch(whereTags({}))
    ])
  },
  onSubmit: async (values) => {
    await dispatch(setTags.unmemoized(values))
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(hasSideEffect({
  LoadingComponent: Loading
  // @ts-ignore
})(Organism))
