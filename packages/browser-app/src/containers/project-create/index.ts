import { connect } from 'react-redux'
import { DispatchPropsType, OwnPropsType } from './types'
import { MapDispatchToProps } from '../../domain/types'
import Organism from './organism'
import { createProject } from '../../domain/project/actions'

const mapDispatchToProps: MapDispatchToProps<DispatchPropsType, OwnPropsType> = (dispatch, props) => ({
  onSubmit: async (values) => {
    await dispatch(createProject(values))
  }
})

export default connect(null, mapDispatchToProps)(Organism)
