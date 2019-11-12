import { connect } from 'react-redux'
import { StatePropsType, DispatchPropsType, OwnPropsType } from './types'
import { MapStateToProps, MapDispatchToProps } from '../../domain/types'
import { whereFeature } from '../../domain/feature/actions'
import Organism from './organism'
import hasSideEffect from '../../has-side-effect'
import { selectFeatures } from '../../domain/feature/selectors'

const mapStateToProps: MapStateToProps<StatePropsType, OwnPropsType> = (state) => ({
  features: selectFeatures(state)
})

const mapDispatchToProps: MapDispatchToProps<DispatchPropsType, OwnPropsType> = (dispatch) => ({
  sideEffect: () => dispatch(whereFeature({}))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(hasSideEffect({})(Organism))
