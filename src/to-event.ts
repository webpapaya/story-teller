import { Maybe, implementsInterface, isAny, isId, isIsoDate } from './verify-interface';

type IsoDate = string;
type Id = Number;

interface ISingleDayEvent {
  id: Id,
  kind: 'singleDayEvent',
  name: string,
  date: IsoDate,
  createdAt: IsoDate,
}

interface IMultiDayEvent {
  id: Id,
  kind: 'multiDayEvent',
  name: string,
  from: IsoDate,
  until: IsoDate,
  createdAt: IsoDate,
}

export type Event = ISingleDayEvent | IMultiDayEvent;



const isSingleDayEvent = (mightBeAnEvent: any) => {
  const inter = {
    id: isId,
    name: isAny,
    date: isIsoDate,
    createdAt: isIsoDate,
  };
  return implementsInterface(inter, mightBeAnEvent);
}

const isMultiDayEvent = (mightBeAnEvent: any) => {
  const inter = {
    id: isId,
    name: isAny,
    from: isIsoDate,
    until: isIsoDate,
    createdAt: isIsoDate,
  };
  return implementsInterface(inter, mightBeAnEvent);
}

const toEvent = (mightBeAnEvent: any): Maybe<Event> => {
  if (isSingleDayEvent(mightBeAnEvent)) {
    return { ...mightBeAnEvent, kind: 'singleDayEvent' };
  } else if (isMultiDayEvent(mightBeAnEvent)) {
    return { ...mightBeAnEvent, kind: 'multiDayEvent' };
  }
  return null;
}

export default toEvent;