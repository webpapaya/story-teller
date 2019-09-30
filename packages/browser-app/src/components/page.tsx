import React from 'react';
import styles from './page.module.css'
import { css } from '../utils/css';
import {SaveOutlined, DeleteOutline} from '@material-ui/icons'
import Badge from './badge';
import InputTextarea from './editor/editor';
import { InputText } from './input-text';
import Heading from './heading';
import { Button } from './button';

const Page = () => (
  <div className={styles.wrapper}>
    <header className={css(styles.header)}>
       <InputText
          label="Title"
          name="title"
          variant="title"
       />
     </header>
     <main className={css(styles.main)}>
      <InputTextarea
        onChange={(x) => console.log(x)}
        value=""
      />
     </main>
     <aside className={css(styles.aside)}>
        <nav className={css(styles.subNavigation)}>
          <Button>
            Save
          </Button>
        </nav>

        <Heading variant="h4" tagName="h2">
          Revisions
        </Heading>
        <ul>
          <Badge
            tagName="li"
            title="Fixed typo"
            bottomLeft="1 additional Tasks"
            bottomRight="Sepp Huber"
          />
          <Badge
            tagName="li"
            title="Fixed typo"
            bottomLeft="1 additional Tasks"
            bottomRight="Sepp Huber"
          />
        </ul>
     </aside>
     <footer className={css(styles.footer)}>
       Last saved 20.01.2000
     </footer>
 </div>
)

export default Page;