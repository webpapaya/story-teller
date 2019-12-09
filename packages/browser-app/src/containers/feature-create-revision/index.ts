import { connect } from 'react-redux'
import uuid from 'uuid'
import { DispatchPropsType, OwnPropsType, StatePropsType } from './types'
import { MapDispatchToProps, MapStateToProps } from '../../domain/types'
import { whereFeature, updateFeature } from '../../domain/feature/actions'
import Organism from './organism'
import hasSideEffect from '../../has-side-effect'
import Loading from '../../components/loading'
import { selectFeature } from '../../domain/feature/selectors'
import { whereRevisions } from '../../domain/revision/actions'
import { whereRevisionForFeature } from '../../domain/revision/selectors'

const mapStateToProps: MapStateToProps<StatePropsType, OwnPropsType> = (state, props) => ({
  defaultValues: selectFeature(state, props.id),
  revision: whereRevisionForFeature(state, props.id)
})

const mapDispatchToProps: MapDispatchToProps<DispatchPropsType, OwnPropsType> = (dispatch, props) => ({
  sideEffect: async () => {
    await Promise.all([
      dispatch(whereFeature({ id: props.id })),
      dispatch(whereRevisions({ featureId: props.id }))
    ])
  },
  onSubmit: async (feature) => {
    await dispatch(updateFeature({ ...feature, id: uuid() }))
    await Promise.all([
      dispatch(whereFeature.unmemoized({ featureId: props.id })),
      dispatch(whereRevisions.unmemoized({ featureId: props.id }))
    ])
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(hasSideEffect({
  LoadingComponent: Loading
})(Organism))
