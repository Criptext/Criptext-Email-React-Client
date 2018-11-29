import './global';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Trumbowyg from 'react-trumbowyg';
import '../../node_modules/trumbowyg/dist/plugins/colors/trumbowyg.colors.min.js';
import '../../node_modules/trumbowyg/dist/plugins/fontfamily/trumbowyg.fontfamily.js';
import '../../node_modules/trumbowyg/dist/plugins/fontsize/trumbowyg.fontsize.js';
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
        onChange={this.onChangeHtmlBody}
        placeholder="Message"
      />
    );
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
