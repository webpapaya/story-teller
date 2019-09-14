import React from 'react';
import {
  List,
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  Title,
  TextFields,
  FormatQuote,
  Code,

} from '@material-ui/icons';
import { EditorState } from 'draft-js'
import styles from './navigation.module.css'
import {ButtonCheckbox} from './button-checkbox';
const BLOCK_TYPES = [
  {label: 'H1', style: 'header-one', Icon: Title},
  {label: 'H2', style: 'header-two', Icon: TextFields },
  {label: 'UL', style: 'unordered-list-item', Icon: List},
  {label: 'Blockquote', style: 'blockquote', Icon: FormatQuote},
  {label: 'Code Block', style: 'code-block', Icon: Code},
]

const INLINE_TYPES = [
  {label: 'Bold', style: 'BOLD', Icon: FormatBold },
  {label: 'Italic', style: 'ITALIC', Icon: FormatItalic },
  {label: 'Underline', style: 'UNDERLINE', Icon: FormatUnderlined },
]

type NavigationProps = {
  editorState: EditorState,
  onToggleInlineStyle: (t: string) => void
  onToggleBlockStyle: (t: string) => void,
  leftNavigation?: JSX.Element,
}

export const Navigation = (props: NavigationProps) => {
  const currentStyle = props.editorState.getCurrentInlineStyle();
  const selection = props.editorState.getSelection();
  const blockType = props.editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  return (
    <section className={styles.actions}>
      <nav>
        { INLINE_TYPES.map((type) => (
          <ButtonCheckbox
            key={type.label}
            name={type.label}
            checked={currentStyle.has(type.style)}
            onChange={() => props.onToggleInlineStyle(type.style) }
            disabled={blockType !== 'unstyled'}
          >
            <type.Icon />
          </ButtonCheckbox>
        )) }

        { BLOCK_TYPES.map((type) => (
          <ButtonCheckbox
            key={type.label}
            name={type.label}
            checked={type.style === blockType}
            onChange={() => props.onToggleBlockStyle(type.style) }
          >
            <type.Icon />
          </ButtonCheckbox>
        ))}
      </nav>

      { props.leftNavigation && (
        <div>
          { props.leftNavigation }
        </div>
      )}
    </section>
  )
}

