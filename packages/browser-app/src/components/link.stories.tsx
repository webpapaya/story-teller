import React from 'react';
import { storiesOf } from '../storybook';
import { Link } from './link';

storiesOf('Link', module)
	.add('primary', () => <Link to="/irrelevant">A Link</Link>)
	.add('primary disabled', () => <Link to="/irrelevant" disabled>A Link</Link>)

	.add('secondary', () => <Link to="/irrelevant" color="secondary">A Link</Link>)
	.add('secondary disabled', () => <Link to="/irrelevant" disabled color="secondary">A Link</Link>)

	.add('danger', () => <Link to="/irrelevant" color="danger">A Link</Link>)
	.add('danger disabled', () => <Link to="/irrelevant" disabled color="danger">A Link</Link>)

	.add('monochrome', () => <Link to="/irrelevant" color="monochrome">A Link</Link>)
	.add('monochrome disabled', () => <Link to="/irrelevant" disabled color="monochrome">A Link</Link>)

	.add('block', () => <Link to="/irrelevant" block>A Link</Link>)
	.add('small', () => <Link to="/irrelevant" size='small'>A Link</Link>)

	.add('link', () => <Link to="/irrelevant" variant="link">A Link</Link>)
	.add('link disabled', () => <Link to="/irrelevant" variant="link" disabled>A Link</Link>)

	.add('outline', () => <Link to="/irrelevant" variant="outline">A Link</Link>)
	.add('outline disabled', () => <Link to="/irrelevant" variant="outline" disabled>A Link</Link>);