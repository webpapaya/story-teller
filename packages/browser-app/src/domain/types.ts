import { AnyAction } from 'redux'
import { ThunkAction, ThunkDispatch } from 'redux-thunk'
import { rootReducer } from '.'
import createHTTPInstance from '../utils/create-http-connection'

export type ExternalDependencies = {
  http: ReturnType<typeof createHTTPInstance>
}

export type AppState = ReturnType<typeof rootReducer>

export type ActionCreator<Args, ReturnValue, Actions extends AnyAction> = (
  arg: Args
) => ThunkAction<Promise<ReturnValue>, AppState, ExternalDependencies, Actions>

export type MapStateToProps<ReturnValue, OwnPropsType> =
  (state: AppState, ownProps: OwnPropsType) => ReturnValue;

export type MapDispatchToProps<ReturnValue, OwnPropsType> = (
  dispatch: ThunkDispatch<AppState, ExternalDependencies, AnyAction>,
  ownProps: OwnPropsType,
) => ReturnValue;

export type UnpackThunk<ActionCreator extends (...args: any) => any> = (
  ...args: Parameters<ActionCreator>
) => ReturnType<ReturnType<ActionCreator>>;
