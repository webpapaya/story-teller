import React from 'react'
import { OrganismPropsType } from './types'

const Organism = (props: OrganismPropsType) => {
  return (
    <ul>
      { props.companies.map((company) => {
        return (
          <li>
            {company.name}
          </li>
        )
      })}
    </ul>
  )
}

export default Organism
