/// <reference types="cypress" />

const buildCredentials = () => ({
  userIdentifier: `test-user.${new Date().toISOString()}@agilesoftwaredev.dev`,
  password: 'secret'
})

const signUp = (credentials = buildCredentials()) => {
  cy.visit(`${Cypress.env('CYPRESS_CLIENT_URL')}/sign-up`)

  cy.get('[name="userIdentifier"]')
    .type(credentials.userIdentifier)

  cy.get('[name="password"]')
    .type(credentials.password)

  cy.get('[data-test-id="signUpForm"]')
    .submit()

  return credentials
}

const signIn = (credentials = signUp()) => {
  cy.visit(`${Cypress.env('CYPRESS_CLIENT_URL')}/sign-in`)

  cy.get('[name="userIdentifier"]')
    .type(credentials.userIdentifier)

  cy.get('[name="password"]')
    .type(credentials.password)

  cy.get('[data-test-id="signInForm"]')
    .submit()

  return credentials
}

const signOut = (credentials = signUp()) => {
  cy.visit(`${Cypress.env('CYPRESS_CLIENT_URL')}/app`)

  cy.get('[data-test-id="sign-out"]')
    .click()

  return credentials
}

const requestPasswordReset = (credentials = signUp()) => {
  cy.visit(`${Cypress.env('CYPRESS_CLIENT_URL')}/request-password-reset`)

  cy.get('[name="userIdentifier"]')
    .type(credentials.userIdentifier)

  cy.get('[data-test-id="requestPasswordReset"]')
    .submit()

  return credentials
}

const extractTokenFromMail = () => {
  cy.wait(200) // eslint-disable-line cypress/no-unnecessary-waiting

  return cy.request(`${Cypress.env('CYPRESS_MAIL_URL')}/messages`, {
    headers: { 'content-type': 'application/json' }
  }).then((allMessages) => {
    const messageId = allMessages.body[allMessages.body.length - 1].id

    return cy
      .request(`${Cypress.env('CYPRESS_MAIL_URL')}/messages/${messageId}.html`)
      .then((message) => new DOMParser()
        .parseFromString(message.body, 'text/html')
        .body
        .querySelector('a')
        ?.href as string)
  })
}

const resetPassword = (credentials = signUp()) => {
  extractTokenFromMail()
    .then(url => {
      console.log(url)
      cy.visit(url)

      cy.get('[name="password"]')
        .type(credentials.password)

      cy.get('[data-test-id="resetPasswordForm"]')
        .submit()
    })

  return credentials
}

context('Authentication', () => {
  it('can sign in after sign up', () => {
    const credentials = buildCredentials()
    signUp(credentials)
    signIn(credentials)
    cy.location('pathname').should('equal', '/app')
  })

  it('can sign in after password reset', () => {
    const credentials = buildCredentials()
    signUp(credentials)
    requestPasswordReset(credentials)
    resetPassword({ ...credentials, password: 'updated' })
    signIn({ ...credentials, password: 'updated' })
    cy.location('pathname').should('equal', '/app')
  })

  it('can sign-in, reload and sign-out afterwards', () => {
    const credentials = buildCredentials()
    signUp(credentials)
    signIn(credentials)
    cy.location('pathname').should('equal', '/app')
    cy.reload()
    cy.location('pathname').should('equal', '/app')
    signOut()
    cy.location('pathname').should('equal', '/sign-in')
  })
})
