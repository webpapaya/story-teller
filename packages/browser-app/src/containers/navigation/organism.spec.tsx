import React from 'react'
// @ts-ignore
import { assertThat, everyItem, truthy as present, hasProperties, allOf, equalTo, hasProperty } from 'hamjest'
import { render, queryByText, fireEvent, cleanup } from '@testing-library/react'
import Organism from './organism'
import { OrganismPropsType } from './types'
import uuid from 'uuid'
import sinon from 'sinon'



const lastCallArgs = (matcher: any) =>
  hasProperty('lastCall', hasProperty('args', matcher))

const projects = [
  { id: uuid(), name: 'Project A' },
  { id: uuid(), name: 'Project B' },
  { id: uuid(), name: 'Project C' }
]

const renderInputMultiSelect = (props: Partial<OrganismPropsType> = {}) => render(
    <Organism
    onSignOut={async () => {}}
    onProjectsSelected={() => { console.log('hallo')}}
    selectedProjects={[projects[0].id, projects[2].id]}
    projects={projects}
    {...props}
  />
)

// afterEach(cleanup);


it('without any projects selected and first project clicked, emits first project id', async () => {
  const onProjectsSelected = sinon.spy()
  const { container } = renderInputMultiSelect({ onProjectsSelected, selectedProjects: [] })
  const firstProject = container.querySelector(`input[value="${projects[0].id}"]`)!


  fireEvent.change(firstProject, { target: { checked: true } })

  // assertThat(onProjectsSelected, lastCallArgs(equalTo([projects[0].id])))
})
