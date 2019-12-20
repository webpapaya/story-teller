import { connect } from 'react-redux'
import { DispatchPropsType, OwnPropsType } from './types'
import { MapDispatchToProps } from '../../domain/types'
import Organism from './organism'
import { createProject } from '../../domain/project/actions'

const mapDispatchToProps: MapDispatchToProps<DispatchPropsType, OwnPropsType> = (dispatch, props) => ({
  onSubmit: async (values) => {
    await dispatch(createProject(values))
    props.history.push(`/feature/${values.id}`)
  }
})

export default connect(null, mapDispatchToProps)(Organism)
