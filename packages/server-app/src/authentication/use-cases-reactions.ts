import { reactToEventSync } from '../lib/use-case'
import { events } from './domain'
import { sendEmail } from '../side-effects/send-mail'
import { template } from '../side-effects/send-mail/template'
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
      ...template({
        header: 'Welcome to Story-Teller',
        body: 'Please confirm your account',
        callToAction: {
          link: `${process.env.CLIENT_URL}/confirm-account?token=${confirmation.plainToken}`,
          text: 'confirm now'
        }
      })
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

    return {
      from: 'info@story-teller.com',
      to: {
        email: event.userAuthentication.userIdentifier,
        name: undefined
      },
      subject: 'Reset your password',
      ...template({
        header: 'Reset your password',
        body: 'To reset your password click the following link',
        callToAction: {
          link: `${process.env.CLIENT_URL}/reset-password?id=${event.userAuthentication.id}&token=${confirmation.plainToken}`,
          text: 'reset now'
        }
      })
    }
  }
})
