import React from 'react';
import { storiesOf } from '../../storybook';
import InputTextarea from './index';
import { Button } from '../button';

storiesOf('Editor', module)
	.add('default', () => (
		<InputTextarea
			leftNavigation={<Button>Save</Button>}
			onChange={(x) => console.log(x)}
			value={`
# Heading 1
Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type

## Heading 2
Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type


## Code Block
\`\`\`
const test = 1;
\`\`\`

## Quote

> Lorem Ipsum is simply dummy text of the printing

## Inline Code
Lorem \`Ipsum is simply\` dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type


- Item 1234
- Item 453
			`}
		/>
	))
