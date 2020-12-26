
export const aroundInvoke = <Rtn>(config: {
  before: () => void
  after: () => void
  execute: () => Rtn
}) => {
  try {
    config.before()
    return config.execute()
  } finally {
    config.after()
  }
}
