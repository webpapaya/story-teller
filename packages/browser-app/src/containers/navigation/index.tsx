import { connect } from 'react-redux';
import { DispatchPropsType, OwnPropsType, StatePropsType } from './types';
import { MapDispatchToProps, MapStateToProps } from '../../domain/types';
import Organism from './organism'
import { signOut } from '../../domain/authentication/actions';

const mapStateToProps: MapStateToProps<StatePropsType, OwnPropsType> = (state, props) => ({
  projects: state.projects,
  selectedProjects: []
})

const mapDispatchToProps: MapDispatchToProps<DispatchPropsType, OwnPropsType> = (dispatch) => {
  return {
    onProjectsSelected: (t) => { console.log('TODO: implement', t) },
    onSignOut: () => dispatch(signOut({}))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Organism)