import React from 'react';
import 'draft-js/dist/Draft.css';
import {Editor, EditorState, RichUtils, ContentBlock, DraftBlockType} from 'draft-js'
import styles from './input-textarea.module.css'
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

    default: return '';
  }
}

type InputTextareaProps = {
  value?: string,
  onChange?: (value: string) => void
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

    // this.handleKeyCommand = this._handleKeyCommand.bind(this);
    // this.mapKeyToEditorCommand = this._mapKeyToEditorCommand.bind(this);
  }

  focus = () => this.editorRef.current!.focus();
  onChange = (editorState: EditorState) => {
    this.setState({editorState}, () => {
      if (this.props.onChange) {
        this.props.onChange(stateToMarkdown(this.state.editorState.getCurrentContent()))
      }
    })
  };

  toggleInlineStyle = (inlineStyle: string) => {
    this.onChange(
      RichUtils.toggleInlineStyle(
        this.state.editorState,
        inlineStyle
      )
    );
  }

  toggleBlockType = (blockType: DraftBlockType) => {
    this.onChange(
      RichUtils.toggleBlockType(
        this.state.editorState,
        blockType
      )
    );
  }

  // _handleKeyCommand(command, editorState) {
  //   const newState = RichUtils.handleKeyCommand(editorState, command);
  //   if (newState) {
  //     this.onChange(newState);
  //     return true;
  //   }
  //   return false;
  // }
  // _mapKeyToEditorCommand(e) {
  //   if (e.keyCode === 9 /* TAB */) {
  //     const newEditorState = RichUtils.onTab(
  //       e,
  //       this.state.editorState,
  //       4, /* maxDepth */
  //     );
  //     if (newEditorState !== this.state.editorState) {
  //       this.onChange(newEditorState);
  //     }
  //     return;
  //   }
  //   return getDefaultKeyBinding(e);
  // }


  render() {
    const {editorState} = this.state;
    // If the user changes block type before entering any text, we can
    // either style the placeholder or hide it. Let's just hide it now.
    let className = 'RichEditor-editor';
    var contentState = editorState.getCurrentContent();
    if (!contentState.hasText()) {
      if (contentState.getBlockMap().first().getType() !== 'unstyled') {
        className += ' RichEditor-hidePlaceholder';
      }
    }


    return (
      <div className="RichEditor-root">
        <BlockStyleControls
          editorState={editorState}
          onToggle={this.toggleBlockType}
        />
        <InlineStyleControls
          editorState={editorState}
          onToggle={this.toggleInlineStyle}
        />
        <div className={className} onClick={this.focus}>
          <Editor
            blockStyleFn={getBlockStyle}
            editorState={editorState}
            // handleKeyCommand={this.handleKeyCommand}
            // keyBindingFn={this.mapKeyToEditorCommand}
            onChange={this.onChange}
            ref={this.editorRef}
            spellCheck={true}
          />
        </div>
      </div>
    );
  }
}

class StyleButton extends React.Component<{
  style: string,
  label: React.ReactChild
  onToggle: (style: string) => void,
  active: boolean
}> {
  onToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    this.props.onToggle(this.props.style);
  };

  render() {
    let className = 'RichEditor-styleButton';
    if (this.props.active) {
      className += ' RichEditor-activeButton';
    }
    return (
      <span className={className} onMouseDown={this.onToggle}>
        {this.props.label}
      </span>
    );
  }
}
const BLOCK_TYPES = [
  {label: 'H1', style: 'header-one'},
  {label: 'H2', style: 'header-two'},
  {label: 'H3', style: 'header-three'},
  {label: 'Blockquote', style: 'blockquote'},
  {label: 'UL', style: 'unordered-list-item'},
  {label: 'OL', style: 'ordered-list-item'},
  {label: 'Code Block', style: 'code-block'},
];

const BlockStyleControls = (props: { editorState: EditorState, onToggle: (t: string) => void }) => {
  const {editorState} = props;
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  return (
    <div className="RichEditor-controls">
      {BLOCK_TYPES.map((type) =>
        <StyleButton
          key={type.label}
          active={type.style === blockType}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      )}
    </div>
  );
};
var INLINE_STYLES = [
  {label: 'Bold', style: 'BOLD'},
  {label: 'Italic', style: 'ITALIC'},
  {label: 'Underline', style: 'UNDERLINE'},
  {label: 'Monospace', style: 'CODE'},
];
const InlineStyleControls = (props: { editorState: EditorState, onToggle: (t: string) => void }) => {
  const currentStyle = props.editorState.getCurrentInlineStyle();

  return (
    <div className="RichEditor-controls">
      {INLINE_STYLES.map((type) =>
        <StyleButton
          key={type.label}
          active={currentStyle.has(type.style)}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      )}
    </div>
  );
};

export default InputTextarea;