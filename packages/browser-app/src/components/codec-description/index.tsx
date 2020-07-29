import React from 'react'

import { AnyCodec } from '@story-teller/shared';
import Heading from '../heading';
import Paragraph from '../paragraph';

import SyntaxHighlighter from 'react-syntax-highlighter';
// @ts-ignore
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const CodecDescription = (props: { name: string, description: string }) => {
  return (
    <div>
      <Heading>{props.name}</Heading>
      <Paragraph>{props.description}</Paragraph>
      <SyntaxHighlighter language="javascript" style={docco}>
        test

      </SyntaxHighlighter>
    </div>
  )
}

export default CodecDescription;