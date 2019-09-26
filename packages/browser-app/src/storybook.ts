import { storiesOf as originalStoriesOf } from '@storybook/react'
// @ts-ignore
import StoryRouter from 'storybook-react-router'

export const storiesOf = (name: string, module: NodeModule) =>
  originalStoriesOf(name, module)
    .addDecorator(StoryRouter())
