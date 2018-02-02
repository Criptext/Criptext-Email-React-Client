import React, { Component } from 'react';
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
      />
    );
  }
}

export default EditorWrapper;
