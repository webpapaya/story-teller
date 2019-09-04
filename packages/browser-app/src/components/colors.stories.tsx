import React from 'react';
import { storiesOf } from '@storybook/react';
import styles from './colors.module.css';

const colors = 'primary secondary success warning danger'.split(' ')
const variants = 'lightest lighter regular darker darkest'.split(' ')

const Colors = () => {
  return (
    <table className={styles.table}>
      { colors.map((color) => (
        <tr key={color}>
          <th>
            { color }
          </th>
          { variants.map((variant) => (
            <td key={variant} style={{ background: `var(--color-${color}-${variant})`}}>
              { variant }
            </td>
          ))}

        </tr>
      ))}
    </table>
  )
}

storiesOf('Colors', module)
	.add('default', () => <Colors />)
