type IsoDate = string;
type Id = Number;

export interface ISingleDayEvent {
  id: Id,
  kind: 'singleDayEvent',
  name: string,
  date: IsoDate,
  createdAt: IsoDate,
}

export interface IMultiDayEvent {
  id: Id,
  kind: 'multiDayEvent',
  name: string,
  from: IsoDate,
  until: IsoDate,
  createdAt: IsoDate,
}

export type Event = ISingleDayEvent | IMultiDayEvent;
