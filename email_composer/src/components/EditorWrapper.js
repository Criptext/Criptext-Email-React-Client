import './global';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Trumbowyg from './Trumbowyg';
import string from './../lang';
import '../../node_modules/@criptext/trumbowyg/dist/plugins/colors/trumbowyg.colors.min.js';
import '../../node_modules/@criptext/trumbowyg/dist/plugins/fontfamily/trumbowyg.fontfamily.js';
import '../../node_modules/@criptext/trumbowyg/dist/plugins/fontsize/trumbowyg.fontsize.js';
import './editor.scss';

class EditorWrapper extends Component {
  render() {
    return (
      <Trumbowyg
        id="react-trumbowyg"
        buttons={[
          ['fontfamily'],
          ['fontsize'],
          ['bold', 'italic', 'underline'],
          ['link'],
          ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
          ['unorderedList', 'orderedList'],
          ['foreColor', 'backColor'],
          ['removeformat']
        ]}
        data={this.props.htmlBody}
        onChange={e => this.onChangeHtmlBody(e)}
        placeholder={string.editor.placeholder}
        removeformatPasted={false}
      />
    );
  }

  componentDidMount() {
    if (this.props.isFocusEditorInput) {
      document.getElementById('react-trumbowyg').focus();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.htmlBody !== this.props.htmlBody) {
      this.props.getHtmlBody(this.props.htmlBody);
    }
  }

  onChangeHtmlBody = e => {
    const html = e.target.innerHTML;
    this.props.getHtmlBody(html);
  };
}

EditorWrapper.propTypes = {
  getHtmlBody: PropTypes.func,
  htmlBody: PropTypes.string,
  isFocusEditorInput: PropTypes.bool,
  onFocusTextEditor: PropTypes.func
};

export default EditorWrapper;
