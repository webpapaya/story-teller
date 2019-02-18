import toEvent from "../src/to-event"

const VALID_SINGLE_DAY_EVENT = {
  id: 1,
  name: 'dummy',
  date: '2000-01-01',
  createdAt: '2000-01-01',
};

const VALID_MULTI_DAY_EVENT = {
  id: 1,
  name: 'dummy',
  from: '2000-01-01',
  until:  '2000-01-02',
  createdAt: '2000-01-01',
};

describe("toEvent", () => {
  it("empty object is invalid", () => {
    expect(toEvent({})).toEqual(null)
  })

  it("null is invalid", () => {
    expect(toEvent(null)).toEqual(null)
  })

  it("a valid single day event is valid", () => {    
    expect(toEvent(VALID_SINGLE_DAY_EVENT))
      .toEqual({ ...VALID_SINGLE_DAY_EVENT, kind: 'singleDayEvent' });
  })

  it("a valid multi day event is valid", () => {
    expect(toEvent(VALID_MULTI_DAY_EVENT))
      .toEqual({ ...VALID_MULTI_DAY_EVENT, kind: 'multiDayEvent' });
  })

  it("with invalid id given, is invalid", () => {
    expect(toEvent({ ...VALID_MULTI_DAY_EVENT, id: 'test' }))
      .toEqual(null);
  })

  it("with invalid date given, is invalid", () => {
    expect(toEvent({ ...VALID_MULTI_DAY_EVENT, until:  '2000-123-02', }))
      .toEqual(null);
  })
})

describe('calculateDays', () => {
  it("single day event, returns 1", () => {
    expect(toEvent(VALID_SINGLE_DAY_EVENT)).toEqual(1)
  })
})