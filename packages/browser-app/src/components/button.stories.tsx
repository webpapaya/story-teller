import React from 'react';
import { storiesOf } from '@storybook/react';
import { Button } from './button';

storiesOf('Button', module)
	.add('primary', () => <Button>A Button</Button>)
	.add('primary disabled', () => <Button disabled>A Button</Button>)

	.add('secondary', () => <Button color="secondary">A Button</Button>)
	.add('secondary disabled', () => <Button disabled color="secondary">A Button</Button>)

	.add('danger', () => <Button color="danger">A Button</Button>)
	.add('danger disabled', () => <Button disabled color="danger">A Button</Button>)

	.add('monochrome', () => <Button color="monochrome">A Button</Button>)
	.add('monochrome disabled', () => <Button disabled color="monochrome">A Button</Button>)

	.add('block', () => <Button block>A Button</Button>)
	.add('small', () => <Button size='small'>A Button</Button>)

	.add('link', () => <Button variant="link">A Button</Button>)
	.add('link disabled', () => <Button variant="link" disabled>A Button</Button>)

	.add('outline', () => <Button variant="outline">A Button</Button>)
	.add('outline disabled', () => <Button variant="outline" disabled>A Button</Button>);