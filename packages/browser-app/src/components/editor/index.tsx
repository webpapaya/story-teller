import React from 'react';

import 'draft-js/dist/Draft.css';
import styles from './index.module.css'
import {Editor, EditorState, RichUtils, ContentBlock, DraftBlockType, Modifier, SelectionState} from 'draft-js'
import {Navigation} from './navigation'

// @ts-ignore
import {stateFromMarkdown} from 'draft-js-import-markdown';
// @ts-ignore
import {stateToMarkdown} from 'draft-js-export-markdown';

const getBlockStyle = (block: ContentBlock) => {
  switch (block.getType()) {
    case 'unstyled': return styles.p;
    case 'header-one': return styles.h1;
    case 'header-two': return styles.h2;
    case 'header-three': return styles.h3;
    case 'unordered-list-item': return styles.ul;
    case 'blockquote': return styles.blockquote;
    case 'code-block': return styles.codeblock;
    default: return '';
  }
}

type InputTextareaProps = {
  value?: string,
  onChange?: (value: string) => void,
  leftNavigation?: JSX.Element,
}

export class InputTextarea extends React.Component<InputTextareaProps> {
  editorRef: React.RefObject<Draft.Editor>
  state: {
    editorState: EditorState
  }

  constructor(props: InputTextareaProps) {
    super(props);
    this.state = {
      editorState: EditorState.createWithContent(stateFromMarkdown(props.value|| ''))
    };
    this.editorRef = React.createRef();
  }

  focus = () => this.editorRef.current!.focus();
  onChange = (editorState: EditorState) => {
    this.setState({editorState}, () => {
      if (this.props.onChange) {
        this.props.onChange(stateToMarkdown(this.state.editorState.getCurrentContent()))
      }
    })
  };

  onTab = (event: React.KeyboardEvent) => {
    this.onChange(RichUtils.onTab(event, this.state.editorState, 4));
  }

  toggleInlineStyle = (inlineStyle: string) => {
    this.onChange(
      RichUtils.toggleInlineStyle(
        this.state.editorState,
        inlineStyle
      )
    );
  }

  _contentWithoutInlineStyles() {
    const selectionState = this.state.editorState.getSelection();
    const anchorKey = selectionState.getAnchorKey();
    const currentContent = this.state.editorState.getCurrentContent();
    const currentContentBlock = currentContent.getBlockForKey(anchorKey);
    return Modifier.replaceText(
      this.state.editorState.getCurrentContent(),
      SelectionState.createEmpty(anchorKey).merge({focusOffset:
        currentContentBlock.getText().length}) as SelectionState,
      currentContentBlock.getText()
    )
  }

  toggleBlockStyle = (blockType: DraftBlockType) => {
    const selectionState = this.state.editorState.getSelection();
    const anchorKey = selectionState.getAnchorKey();
    const currentContent = this.state.editorState.getCurrentContent();
    const currentContentBlock = currentContent.getBlockForKey(anchorKey);
    const nextType = currentContentBlock.getType() === blockType
        ? 'unstyled'
        : blockType;

    const nextContent = Modifier.setBlockType(
      this._contentWithoutInlineStyles(),
      selectionState,
      nextType
    )

    this.onChange(EditorState.push(
      this.state.editorState,
      nextContent,
      'change-block-data'
    ));
  }

  render() {
    const {editorState} = this.state;
    return (
      <div >
        <Navigation
          editorState={editorState}
          onToggleInlineStyle={this.toggleInlineStyle}
          onToggleBlockStyle={this.toggleBlockStyle}
          leftNavigation={this.props.leftNavigation}
        />
        <div onClick={this.focus}>
          <Editor
            blockStyleFn={getBlockStyle}
            editorState={editorState}
            onTab={this.onTab}
            onChange={this.onChange}
            ref={this.editorRef}
            spellCheck={true}
          />
        </div>
      </div>
    );
  }
}

export default InputTextarea;