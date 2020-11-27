import { reactToEventSync } from '../lib/use-case'
import { events } from './domain'
import { sendEmail } from '../side-effects/send-mail'

export const reactToUserRegistered = reactToEventSync({
  event: events.userRegistered,
  useCase: sendEmail,
  mapper: (event) => {
    return {
      from: 'info@story-teller.com',
      to: {
        email: event.userAuthentication.userIdentifier,
        name: undefined
      },
      subject: 'Confirm your account',
      html: '<b>html email</b>',
      text: 'html email'
    }
  }
})
