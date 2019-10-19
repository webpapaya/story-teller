import React from 'react';
import { OrganismPropsType } from './types';
import styles from './organism.module.css'

const Organism = (props: OrganismPropsType) => (
  <>
    {props.features.map((feature) => (
      <div key={feature.id}>
        { feature.title }
      </div>
    ))}
  </>
)

export default Organism