import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Editor } from 'react-draft-wysiwyg';
import './editor.css';

class EditorWrapper extends Component {
  render() {
    return (
      <Editor
        {...this.props}
        toolbar={{
          options: [
            'inline',
            'fontSize',
            'fontFamily',
            'list',
            'textAlign',
            'colorPicker',
            'link',
            'emoji'
          ],
          inline: {
            options: ['bold', 'italic', 'underline']
          },
          textAlign: { inDropdown: true },
          link: {
            inDropdown: false,
            defaultTargetOption: '_blank'
          },
          history: { inDropdown: true }
        }}
        editorState={this.props.htmlBody}
        onEditorStateChange={this.onChangeHtmlBody}
        placeholder={'Message'}
        blockRenderMap={this.props.blockRenderMap}
        onFocus={() => this.handleFocus()}
      />
    );
  }

  onChangeHtmlBody = html => {
    this.props.getHtmlBody(html);
  };

  handleFocus = () => {
    this.props.onFocusTextEditor(true);
  };
}

EditorWrapper.propTypes = {
  blockRenderMap: PropTypes.object,
  getHtmlBody: PropTypes.func,
  htmlBody: PropTypes.object,
  onFocusTextEditor: PropTypes.func
};

export default EditorWrapper;
