import { reactToEventSync } from '../lib/use-case'
import { events } from './domain'
import { sendEmail } from '../side-effects/send-mail'
import { ReactionError } from '../errors'

export const reactToUserRegistered = reactToEventSync({
  event: events.userRegistered,
  useCase: sendEmail,
  mapper: (event) => {
    const confirmation = event.userAuthentication.confirmation
    if (confirmation.state !== 'active') {
      throw new ReactionError('Token needs to be active')
    }

    return {
      from: 'info@story-teller.com',
      to: {
        email: event.userAuthentication.userIdentifier,
        name: undefined
      },
      subject: 'Confirm your account',
      html: `
        <h1>Welcome to Story-Teller</h1>
        <p>Please confirm your account with the following link
          <a href="${process.env.CLIENT_URL}/confirm-account?token=${confirmation.plainToken}">confirm now</a>
        </p>
      `,
      text: `
        Welcome to Story-Teller

        Please confirm your account with the following link:
          ${process.env.CLIENT_URL}/confirm-account?token=${confirmation.token}
      `
    }
  }
})
