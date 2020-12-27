import React, { useEffect } from 'react';
import { OrganismPropsType } from '../types';
import {
  ExitToApp
} from '@material-ui/icons';
import styles from './index.module.css'
import { css } from '../../../utils/css';
import { useTranslations } from './translations';

const Organism = (props: OrganismPropsType) => {
  const ref = React.createRef<HTMLDivElement>()
  const {t} = useTranslations()
  useEffect(() => {
    const htmlDOM = document.querySelector("html")!
    const setHTMLPadding = () => {
      if (!ref.current) { return }
      const padding = ref.current.offsetHeight || 0
      htmlDOM.style.paddingTop = `${padding}px`
    }
    setHTMLPadding()
    window.addEventListener('resize', setHTMLPadding);

    return () => {
      htmlDOM.style.paddingTop = `0px`
      window.removeEventListener('resize', setHTMLPadding)
    };
  }, [ref.current])

  return (
    <nav className={css(styles.navigationWrp)} ref={ref}>
      <ExitToApp onClick={() => props.onSignOut()} aria-label={t('signOut')} data-test-id="sign-out"/>
    </nav>
  )
}

export default Organism