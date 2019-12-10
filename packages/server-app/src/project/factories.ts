import uuid from 'uuid';
import * as Factory from 'factory.ts'
import { Project } from '@story-teller/shared'

export const projectFactory = Factory.Sync.makeFactory<typeof Project.aggregate['O']>({
  id: Factory.each(() => uuid()),
  name: 'A project',
})
