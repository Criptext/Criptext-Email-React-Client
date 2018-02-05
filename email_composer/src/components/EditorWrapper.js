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
          link: { inDropdown: true },
          history: { inDropdown: true }
        }}
        editorState={this.props.htmlBody}
        onEditorStateChange={this.onChangeHtmlBody}
      />
    );
  }

  onChangeHtmlBody = html => {
    this.props.getHtmlBody(html);
  };
}

EditorWrapper.propTypes = {
  getHtmlBody: PropTypes.func,
  htmlBody: PropTypes.object
};

export default EditorWrapper;
