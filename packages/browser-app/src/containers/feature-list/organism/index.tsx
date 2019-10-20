import React from 'react';
import {Link} from 'react-router-dom'
import { OrganismPropsType } from '../types';
import styles from './index.module.css'
import Heading from '../../../components/heading'
import { css } from '../../../utils/css';

const Organism = (props: OrganismPropsType) => (
  <>
    {props.features.map((feature) => (
      <Link
        to={`/feature/${feature.id}`}
        className={css(styles.wrapper)}
      >
        <Heading variant="h3" noMargin tagName='span'>
          {feature.title}
        </Heading>
      </Link>
    ))}
  </>
)

export default Organism