import React from 'react'
import uuid from 'uuid'
import sinon from 'sinon'
// @ts-ignore
import { assertThat, equalTo } from 'hamjest'
import { render, fireEvent, cleanup } from '@testing-library/react'
import Organism from './organism'
import { OrganismPropsType } from './types'
import { lastCallNthArg } from '../../utils/test-helpers'

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

afterEach(cleanup);

describe('onProjectsSelected', () => {
  it('emits first project id, WHEN no projects selected and first project clicked, ', async () => {
    const onProjectsSelected = sinon.spy()
    const { container } = renderInputMultiSelect({ onProjectsSelected, selectedProjects: [] })
    const projectInput = container.querySelector(`input[value="${projects[0].id}"]`)!

    fireEvent.change(projectInput, { target: { value: '', checked: true } })
    assertThat(onProjectsSelected, lastCallNthArg(0, equalTo([projects[0].id])))
  })


  it('emits no projects, WHEN first project selected and first project clicked', async () => {
    const onProjectsSelected = sinon.spy()
    const { container } = renderInputMultiSelect({ onProjectsSelected, selectedProjects: [
      projects[0].id
    ] })
    const projectInput = container.querySelector(`input[value="${projects[0].id}"]`)!

    fireEvent.change(projectInput, { target: { value: '', checked: false } })
    assertThat(onProjectsSelected, lastCallNthArg(0, equalTo([])))
  })

  it('emits both projects, WHEN first project selected and second project clicked, ', async () => {
    const onProjectsSelected = sinon.spy()
    const { container } = renderInputMultiSelect({ onProjectsSelected, selectedProjects: [
      projects[0].id
    ] })
    const projectInput = container.querySelector(`input[value="${projects[1].id}"]`)!

    fireEvent.change(projectInput, { target: { value: '', checked: true } })
    assertThat(onProjectsSelected, lastCallNthArg(0, equalTo([projects[0].id, projects[1].id])))
  })
})
