import { reactToEventSync } from '../lib/use-case'
import { events } from './domain'
import { sendEmail } from '../side-effects/send-mail'

export const reactToUserRegistered = reactToEventSync({
  event: events.userRegistered,
  mapper: (event) => {
    return {
      from: 'info@story-teller.com',
      to: {
        email: event.userAuthentication.userIdentifier
      },
      subject: 'Confirm your account',
      html: '<b>html email</b>',
      text: 'html email'
    }
  },
  useCase: sendEmail
})
