import React from 'react'
import { OrganismPropsType } from './types'
import {Link} from "../../components/link";

const Organism = (props: OrganismPropsType) => {
  return (
    <ul>
      { props.companies.map((company) => {
        return (
          <li key={company.id}>
            {company.name}
            { props.canRename(company) && (
                <Link to={`/app/company-rename/${company.id}`}>
                  Rename
                </Link>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default Organism
