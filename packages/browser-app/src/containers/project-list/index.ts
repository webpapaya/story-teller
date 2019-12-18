import { connect } from 'react-redux'
import { DispatchPropsType, OwnPropsType, StatePropsType } from './types'
import { MapDispatchToProps, MapStateToProps } from '../../domain/types'
import Organism from './organism'
import hasSideEffect from '../../has-side-effect'
import { whereProjects } from '../../domain/project/actions'
import { selectProjects } from '../../domain/project/selectors'

const mapStateToProps: MapStateToProps<StatePropsType, OwnPropsType> = (state) => ({
  projects: selectProjects(state)
})

const mapDispatchToProps: MapDispatchToProps<DispatchPropsType, OwnPropsType> = (dispatch) => ({
  sideEffect: async () => {
    await Promise.all([
      dispatch(whereProjects({}))
    ])
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(hasSideEffect({})(Organism))
