import { AnyCodec, v } from '@story-teller/shared'

export const domainEvent = <Name extends string, Codec extends AnyCodec>(name: Name, codec: Codec) => {
  return {
    event: v.record({
      name: v.literal(name),
      payload: v.record({
        aggregate: codec
      })
    }),
    mapper: ({ aggregateAfter }: { aggregateAfter: Codec['O'] }) => ({
      name: name,
      payload: { aggregate: aggregateAfter }
    })
  }
}
