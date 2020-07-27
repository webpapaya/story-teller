import React from 'react'
import { AnyCodec } from '@story-teller/shared';
import Heading from '../heading';
import Paragraph from '../paragraph';

const CodecDescription = (props: { name: string, description: string }) => {
  return (
    <div>
      <Heading>{props.name}</Heading>
      <Paragraph>{props.description}</Paragraph>
    </div>
  )
}

export default CodecDescription;