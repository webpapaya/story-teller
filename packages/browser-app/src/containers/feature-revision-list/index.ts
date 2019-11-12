import { connect } from 'react-redux'
import { DispatchPropsType, OwnPropsType, StatePropsType } from './types'
import { MapDispatchToProps, MapStateToProps } from '../../domain/types'
import Organism from './organism'
import hasSideEffect from '../../has-side-effect'
import { whereRevisions } from '../../domain/revision/actions'
import { whereRevisionForFeature } from '../../domain/revision/selectors'

const mapStateToProps: MapStateToProps<StatePropsType, OwnPropsType> = (state, props) => ({
  revision: whereRevisionForFeature(state, props.id)
})

const mapDispatchToProps: MapDispatchToProps<DispatchPropsType, OwnPropsType> = (dispatch, props) => ({
  sideEffect: async () => {
    await Promise.all([
      dispatch(whereRevisions({ featureId: props.id }))
    ])
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(hasSideEffect({})(Organism))
