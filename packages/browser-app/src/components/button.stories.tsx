import React from 'react';
import { storiesOf } from '@storybook/react';
import { Button } from './button';

storiesOf('Button', module)
	.add('default', () => <Button>A Button</Button>)
	.add('default disabled', () => <Button disabled>A Button</Button>)

	.add('danger', () => <Button color="danger">A Button</Button>)
	.add('danger disabled', () => <Button disabled color="danger">A Button</Button>)

	.add('secondary', () => <Button color="secondary">A Button</Button>)
	.add('secondary disabled', () => <Button disabled color="secondary">A Button</Button>)

	.add('block', () => <Button block>A Button</Button>);