import { assertThat, equalTo, hasProperty } from 'hamjest'
import { assertDifference, t } from '../spec-helpers'
import { sequentially } from '../utils/sequentially'
import { AnyCodec } from '@story-teller/shared'
import { ExternalDependencies } from '../lib/use-case'

export const buildTestsForEnsureRepository = async <Codec extends AnyCodec>(
  codec: Codec,
  dbTable: string,
  ensure: (domainObject: Codec['O'], deps: ExternalDependencies) => Promise<any>
): Promise<void> => {
  it('WHEN record does not exist, creates a new record', t(async (clients) => {
    const promises = codec.build().map((factory) => async () => {
      await assertDifference(clients, dbTable, 1, async () => {
        const domainObject = factory()
        const result = await ensure(domainObject, clients)
        assertThat(result, hasProperty('id', domainObject.id.toLowerCase()))
      })
    })
    await sequentially(promises)
  }))

  it('WHEN record already exists, does not insert new record', t(async (clients) => {
    const promises = codec.build().map((factory) => async () => {
      const domainObject = factory()
      const firstResult = await ensure(domainObject, clients)
      await assertDifference(clients, dbTable, 0, async () => {
        const secondResult = await ensure(firstResult, clients)
        assertThat(firstResult, equalTo(secondResult))
      })
    })
    await sequentially(promises)
  }))
}
