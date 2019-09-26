import React from 'react';
import styles from './page.module.css'
import { css } from '../utils/css';
import {SaveOutlined, DeleteOutline} from '@material-ui/icons'
import { InputMultiSelect } from './input-multi-select';
import InputTextarea from './editor/editor';
import { InputText } from './input-text';

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
       <section className={css(styles.aside1stLevel)}>
        <nav className={css(styles.subNavigation)}>
          <button className={css(styles.button, styles.secondary)}>
            <DeleteOutline />
          </button>

          <button className={css(styles.button, styles.primary)}>
            <SaveOutlined />
          </button>
        </nav>

        <InputMultiSelect
            label="Tags"
            name="tags"
            options={[
              { key: 'test1', label: 'First', value: 1 },
              { key: 'test2', label: 'Second', value: 2 },
              { key: 'test3', label: 'Third', value: 3 }
            ]}
          />
       </section>
       {/* <section className={css(styles.aside2ndLevel)}>
            hallo
       </section> */}
     </aside>
     <footer className={css(styles.footer)}>
       Last saved 20.01.2000
     </footer>
 </div>
)

export default Page;