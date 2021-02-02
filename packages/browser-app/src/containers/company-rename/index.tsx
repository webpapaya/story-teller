import {connect} from 'react-redux'
import {DispatchPropsType, OwnPropsType, StatePropsType} from './types'
import {MapDispatchToProps, MapStateToProps} from '../../domain/types'
import Organism from './organism'
import {renameCompany} from '../../domain/company/actions'

const mapStateToProps: MapStateToProps<StatePropsType, OwnPropsType> = (state, props) => {
  console.log(state)
  return {
    company: state.company.find((company) => Boolean(company.id === props.id))
  }
}

const mapDispatchToProps: MapDispatchToProps<DispatchPropsType, OwnPropsType> = (dispatch, props) => ({
  onSubmit: async (values) => dispatch(renameCompany({...values, companyId: props.id }))
})

export default connect(mapStateToProps, mapDispatchToProps)(Organism)
