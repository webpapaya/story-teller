import { CommandDefinition, AnyCodec } from '@story-teller/shared'
import { Link } from './permission/types'

type CanBuilder = <
  D extends AnyCodec,
  F extends AnyCodec,
  A extends CommandDefinition<D, F>
>(
  definition: A
) => (links: Record<string, Link[]>) => (id: Partial<{ id: string }>) => boolean

export const buildPermissionSelector: CanBuilder = (definition) => {
  return (links) => (aggregate) => {
    return Boolean(aggregate.id &&
        links[aggregate.id].some(permission =>
          permission.actionName === definition.action &&
            permission.aggregateName === definition.model))
  }
}
