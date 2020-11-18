interface PasswordResetRequestEmail {
  type: 'PasswordResetRequestEmail'
  language: 'de' | 'en'
  to: string
  payload: {
    token: string
  }
}

interface RegisterEmail {
  type: 'RegisterEmail'
  language: 'de' | 'en'
  to: string
  payload: {
    token: string
  }
}

export type Emails =
| PasswordResetRequestEmail
| RegisterEmail

export type SendMail = (email: Emails) => Promise<void>
export const sendMail: SendMail = async () => {

}
