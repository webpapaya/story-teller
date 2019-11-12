import { connect } from 'react-redux'
import { DispatchPropsType, OwnPropsType } from './types'
import { MapDispatchToProps } from '../../domain/types'
import { createFeature } from '../../domain/feature/actions'
import Organism from './organism'

const mapDispatchToProps: MapDispatchToProps<DispatchPropsType, OwnPropsType> = (dispatch, props) => ({
  onSubmit: async (values) => {
    await dispatch(createFeature(values))
    props.history.push(`/feature/${values.id}`)
  }
})

export default connect(null, mapDispatchToProps)(Organism)
