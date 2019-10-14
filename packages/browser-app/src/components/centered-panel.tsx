import React from 'react'
import { css } from '../utils/css'
import styles from './centered-panel.module.css'

type CenteredPanelProps = {
  children: React.ReactNode
}

const CenteredPanel = ({ children }: CenteredPanelProps) => (
  <section className={css(styles.centered)}>
    {children}
  </section>
)

export default CenteredPanel
