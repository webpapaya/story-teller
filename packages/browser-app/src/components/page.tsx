import React from 'react';
import styles from './page.module.css'
import { css } from '../utils/css';
import Badge from './badge';
import InputTextarea from './editor/editor';
import { InputText } from './input-text';
import Heading from './heading';
import { Button } from './button';
import Task from './task';

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
      <div>
        <Heading variant="h3" tagName="h2">
          Tasks
        </Heading>
        <Task id="1" title="Update Docs 1" column="Todo" />
        <Task id="2" title="Update Docs 2" column="Todo" />
        <Task id="3" title="Update Docs 3" column="Todo" />
        <Task id="4" title="Update Docs 4" column="Todo" />
        <Task id="5" title="Update Docs 5" column="Todo" />
        <Task id="6" title="Update Docs 6" column="Todo" />
      </div>
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