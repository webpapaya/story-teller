import { sideEffect } from '../../lib/use-case'
import { v } from '@story-teller/shared'
import { email } from '../../utils/custom-codecs'

const mail = v.record({
  from: email,
  to: v.record({
    name: v.option(v.string),
    email: email
  }),
  subject: v.nonEmptyString,
  text: v.nonEmptyString,
  html: v.nonEmptyString
})
export type Mail = typeof mail['O']

export const sendEmail = sideEffect({
  aggregate: mail,
  sideEffect: async (aggregate, clients) => {
    await clients.sendMail({
      from: aggregate.from,
      to: aggregate.to.name
        ? `${aggregate.to.name} <${aggregate.to.email}>`
        : `${aggregate.to.email}`,
      subject: aggregate.subject,
      text: aggregate.text,
      html: aggregate.html
    })
  }
})
