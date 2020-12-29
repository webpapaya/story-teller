import { connect } from 'react-redux';
import { DispatchPropsType, OwnPropsType } from './types';
import { MapDispatchToProps } from '../../domain/types';
import Organism from './organism'
import { createCompany } from '../../domain/company/actions';
import { refreshToken } from '../../domain/authentication/actions';

const mapDispatchToProps: MapDispatchToProps<DispatchPropsType, OwnPropsType> = (dispatch, props) => ({
  onSubmit: async (values) => {
    await dispatch(createCompany(values))
    await dispatch(refreshToken())
  }
})

export default connect(null, mapDispatchToProps)(Organism)
