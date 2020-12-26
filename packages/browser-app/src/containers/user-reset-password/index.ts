import { connect } from 'react-redux'
import { DispatchPropsType, OwnPropsType, StatePropsType } from './types'
import { MapStateToProps, MapDispatchToProps } from '../../domain/types'
import Organism from './organism'
import { resetPassword } from '../../domain/authentication/actions'
import { readFromLocation } from '../../utils/read-from-location'

export const mapStateToProps: MapStateToProps<StatePropsType, OwnPropsType> = () => {
  return {
    defaultValues: {
      id: readFromLocation('id', ''),
      token: readFromLocation('token', '')
    }
  }
}

const mapDispatchToProps: MapDispatchToProps<DispatchPropsType, OwnPropsType> = (dispatch, props) => ({
  onSubmit: async (values) => {
    await dispatch(resetPassword(values))
    props.history.push('/sign-in')
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(Organism)
