import React from 'react';
import styles from './index.module.css';
import { AnyCodec } from '@story-teller/shared';
import Badge from '../badge';

type BasicTypes =
  | { type: 'string' }
  | { type: 'number' }
  | { const: 'undefined' }

type JSONSchema =
  | BasicTypes
  | { oneOf: BasicTypes[] }


const isOptional = (schema: JSONSchema) =>
  'const' in schema && schema.const === 'undefined'

const Obj = (props: { schema: JSONSchema }) => {
  const { schema } = props

  if ('oneOf' in schema) {
    const typesToRender = schema.oneOf
      .map((type) => <Obj schema={type} />)

    return (
      <div className={styles.oneOf}>
        oneOf
        {typesToRender}
      </div>
    )
  }

  if ('type' in schema) {
    return <Badge title={schema.type} />
  }

  if ('const' in schema) {
    return <Badge title={schema.const} />
  }

  return (
    <div>hallo</div>
  )
}

const DomainObject = (props: { codec: AnyCodec }) => {
  const schema = JSON.parse(JSON.stringify(props.codec)) as JSONSchema
  return <Obj schema={schema} />
}

export default DomainObject;