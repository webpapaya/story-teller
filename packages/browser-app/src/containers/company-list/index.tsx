import { connect } from 'react-redux'
import { DispatchPropsType, OwnPropsType, StatePropsType } from './types'
import { MapDispatchToProps, MapStateToProps } from '../../domain/types'
import Organism from './organism'
import {canRenameCompany, createCompany, whereCompanies} from '../../domain/company/actions'
import hasSideEffect from '../../has-side-effect'

const mapStateToProps: MapStateToProps<StatePropsType, OwnPropsType> = (state) => {
  return {
    companies: state.company,
    canRename: canRenameCompany(state.permission)
  }
}

const mapDispatchToProps: MapDispatchToProps<DispatchPropsType, OwnPropsType> = (dispatch, props) => ({
  sideEffect: async () => dispatch(whereCompanies({}))
})

export default connect(mapStateToProps, mapDispatchToProps)(hasSideEffect({})(Organism))
