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

export const reactToPasswordResetRequested = reactToEventSync({
  event: events.passwordResetRequested,
  useCase: sendEmail,
  mapper: (event) => {
    const confirmation = event.userAuthentication.passwordReset
    if (confirmation.state !== 'active') {
      throw new ReactionError('Token needs to be active')
    }
    const resetPasswordLink = `${process.env.CLIENT_URL}/reset-password?id=${event.userAuthentication.id}&token=${confirmation.plainToken}`

    return {
      from: 'info@story-teller.com',
      to: {
        email: event.userAuthentication.userIdentifier,
        name: undefined
      },
      subject: 'Reset your password',
      html: `
        <p>click the following link to reset your password
          <a href="${resetPasswordLink}">reset now</a>
        </p>
      `,
      text: `
        click the following link to reset your password:
          ${resetPasswordLink}
      `
    }
  }
})
