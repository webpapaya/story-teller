export type Maybe<T> = T | null;

export const implementsInterface = (inter: any, mightBeAnEvent: any) => {
    return isObject(mightBeAnEvent) && Object.keys(inter).every((key) => {
      const containsKey = Object.keys(mightBeAnEvent).includes(key);
      return containsKey && inter[key](mightBeAnEvent[key]);
    });
  };
export const isObject = (maybeObject: any) => typeof maybeObject === 'object' && maybeObject !== null;
export const isAny = (mightBeId: any) => true;
export const isId = (mightBeId: any) => typeof mightBeId === 'number';
export const isIsoDate = (mightBeIsoDate: any) => 
    typeof mightBeIsoDate === 'string' && 
        mightBeIsoDate.match(/^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])$/);

