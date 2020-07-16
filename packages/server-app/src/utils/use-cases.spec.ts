// import { Lens, Optional } from 'monocle-ts'
// import { v, AnyCodec } from '@story-teller/shared'
// import deepEqual from 'deep-equal'
// import { assertThat, equalTo, hasProperty, allOf, throws } from 'hamjest'
// import { literal } from '@story-teller/shared/dist/lib'
// import { some, none } from 'fp-ts/lib/Option'
// import { useCaseFromCodec, useCaseWithArgFromCodec } from './use-case'

// const nonEmptyString = v.clampedString(1, Number.POSITIVE_INFINITY)

// const addressCodec = v.record({
//   kind: literal('address'),
//   street: nonEmptyString,
//   streetAppendix: nonEmptyString,
//   zipCode: v.clampedString(4, 5),
//   country: v.union([
//     v.literal('at'),
//     v.literal('de')
//   ])
// })
// type AddressT = typeof addressCodec.O

// const emailCodec = v.record({
//   kind: literal('email'),
//   value: nonEmptyString
// })
// type EmailT = typeof emailCodec.O

// const phoneCodec = v.record({
//   kind: literal('phone'),
//   value: nonEmptyString
// })
// type PhoneT = typeof phoneCodec.O

// const contactCodec = v.union([
//   emailCodec,
//   addressCodec,
//   phoneCodec
// ])
// type ContactT = typeof contactCodec.O

// const withRequiredStandardCodec = (codec: AnyCodec) => v.record({
//   standard: codec,
//   others: v.array(codec)
// })

// const userCodec = v.record({
//   name: nonEmptyString,
//   status: v.union([v.literal('enabled'), v.literal('disabled')]),
//   contact: v.option(withRequiredStandardCodec(contactCodec))
// })
// type UserT = typeof userCodec.O

// const statusLens = Lens.fromProp<UserT>()('status')
// const nameLens = Lens.fromProp<UserT>()('name')
// const contactLens = Lens.fromProp<UserT>()('contact')
// const otherContacts = new Lens<UserT, ContactT[]>(
//   (user) => user.contact ? [user.contact.standard, ...user.contact.others] : [],
//   (contacts) => (user) => {
//     const standard = contacts.find((contact) => deepEqual(contact, user.contact?.standard)) || contacts[0]
//     const others = contacts.filter((contact) => contact === standard)
//     const contact = standard ? { standard, others } : undefined
//     return ({ ...user, contact })
//   }
// )

// const standardContact = new Optional<UserT, ContactT>(
//   (user) => user.contact?.standard ? some(user.contact.standard) : none,
//   (standard) => (user) => {
//     const contacts = otherContacts.get(user)
//     const others = contacts.filter((contact) => !deepEqual(contact, standard))
//     return ({ ...user, contact: { others, standard } })
//   }
// )

// export const enableUser = useCaseFromCodec(userCodec)
//   .preCondition((user) => user.status === 'disabled')
//   .map(statusLens.set('enabled'))

// export const disableUser = useCaseFromCodec(userCodec)
//   .preCondition((user) => user.status === 'enabled')
//   .map(statusLens.set('disabled'))

// export const renameUserName = useCaseWithArgFromCodec(userCodec, userCodec.schema.name)
//   .map((user, name) => nameLens.set(name)(user))

// export const changeStandardContact = useCaseWithArgFromCodec(userCodec, contactCodec)
//   .map((user, value) => standardContact.set(value)(user))

// export const unsetUserContacts = useCaseFromCodec(userCodec)
//   .map(contactLens.set(undefined))

// export const removeUserContact = useCaseWithArgFromCodec(userCodec, contactCodec)
//   .map((user, contactToRemove) => {
//     const contacts = otherContacts.get(user)
//     const nextContacts = contacts.filter((contact) => !deepEqual(contactToRemove, contact))
//     return otherContacts.set(nextContacts)(user)
//   })

// export const addUserContact = useCaseWithArgFromCodec(userCodec, contactCodec)
//   .map((user, contactToAdd) => {
//     const contacts = otherContacts.get(user)
//     const nextContacts = [...contacts, contactToAdd]
//     return otherContacts.set(nextContacts)(user)
//   })

// describe('user', () => {
//   it('enables a user', () => {
//     const disabledUser: UserT = {
//       name: 'sepp',
//       status: 'disabled',
//       contact: undefined
//     }

//     assertThat(enableUser.runReader(disabledUser),
//       hasProperty('status', equalTo('enabled')))
//   })

//   it('when user is already enabled, throws unmet precondition error', () => {
//     const disabledUser: UserT = {
//       name: 'sepp',
//       status: 'enabled',
//       contact: undefined
//     }

//     assertThat(() => enableUser.runReader(disabledUser), throws())
//   })

//   it('disable a user', () => {
//     const enabledUser: UserT = {
//       name: 'sepp',
//       status: 'enabled',
//       contact: undefined
//     }

//     assertThat(disableUser.runReader(enabledUser),
//       hasProperty('status', equalTo('disabled')))
//   })

//   it('rename user name', () => {
//     const enabledUser: UserT = {
//       name: 'sepp',
//       status: 'enabled',
//       contact: undefined
//     }
//     const newName = 'new name'

//     assertThat(renameUserName.runReader(enabledUser, newName),
//       hasProperty('name', equalTo(newName)))
//   })

//   describe('removeEmail', () => {
//     it('removes email', () => {
//       const enabledUser: UserT = {
//         name: 'sepp',
//         status: 'enabled',
//         contact: {
//           standard: {
//             kind: 'email',
//             value: 'whatever'
//           },
//           others: []
//         }
//       }

//       assertThat(removeUserContact.runReader(enabledUser, enabledUser.contact!.standard),
//         hasProperty('contact', equalTo(undefined)))
//     })
//   })

//   describe('changeStandardContact', () => {
//     it('when contact is already set as standard', () => {
//       const enabledUser: UserT = {
//         name: 'sepp',
//         status: 'enabled',
//         contact: {
//           standard: {
//             kind: 'email',
//             value: 'whatever'
//           },
//           others: []
//         }
//       }

//       const newEmail = { kind: 'email', value: 'whatever@test.com' }
//       assertThat(changeStandardContact.runReader(enabledUser, { kind: 'email', value: 'whatever@test.com' }), allOf(
//         hasProperty('contact.standard', equalTo(newEmail)),
//         hasProperty('contact.others', equalTo([enabledUser.contact!.standard])))
//       )
//     })

//     it('when no contact exists', () => {
//       const enabledUser: UserT = {
//         name: 'sepp',
//         status: 'enabled',
//         contact: undefined
//       }

//       const newEmail = { kind: 'email', value: 'whatever@test.com' }
//       assertThat(changeStandardContact.runReader(enabledUser, { kind: 'email', value: 'whatever@test.com' }), allOf(
//         hasProperty('contact.standard', equalTo(newEmail)),
//         hasProperty('contact.others', equalTo([]))
//       ))
//     })
//   })

//   describe('addUserContact', () => {
//     it('without any contact, sets given contact as standard', () => {
//       const enabledUser: UserT = {
//         name: 'sepp',
//         status: 'enabled',
//         contact: undefined
//       }
//       const contact = { kind: 'email', value: 'whatever' } as const

//       assertThat(addUserContact.runReader(enabledUser, contact),
//         hasProperty('contact.standard', equalTo(contact)))
//     })

//     it('with a standard contact already set, adds contact to others', () => {
//       const enabledUser: UserT = {
//         name: 'sepp',
//         status: 'enabled',
//         contact: {
//           standard: { kind: 'email', value: 'second@email.com' },
//           others: []
//         }
//       }

//       const contact = { kind: 'email', value: 'second@email.com' } as const
//       assertThat(addUserContact.runReader(enabledUser, contact),
//         hasProperty('contact.others', equalTo([contact])))
//     })
//   })
// })
