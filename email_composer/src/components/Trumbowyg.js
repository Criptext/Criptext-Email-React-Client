import React, { Component } from 'react';
import PropTypes from 'prop-types';
import jquery from 'jquery';
import trumbowyg from '@criptext/trumbowyg'; // eslint-disable-line no-unused-vars
const $ = jquery;
class Trumbowyg extends Component {
  // eslint-disable-next-line no-useless-constructor
  constructor(props) {
    super(props);
  }

  render() {
    return <div id={`${this.props.id}`} placeholder={this.props.placeholder} />;
  }

  componentDidMount() {
    const {
      id,
      lang,
      buttons,
      semantic,
      resetCss,
      removeformatPasted,
      autogrow,
      data,
      disabled,
      onFocus,
      onBlur,
      onInit,
      onChange,
      onResize,
      onPaste,
      onOpenFullScreen,
      onCloseFullScreen,
      onClose,
      btnsDef,
      plugins
    } = this.props;

    const trumbowygInstance = $(`#${id}`).trumbowyg({
      lang: lang,
      btns: buttons,
      btnsDef: btnsDef,
      semantic: semantic,
      resetCss: resetCss,
      removeformatPasted: removeformatPasted,
      autogrow: autogrow,
      plugins: plugins
    });

    if (onFocus) {
      trumbowygInstance.on('tbwfocus', onFocus);
    }

    if (onBlur) {
      trumbowygInstance.on('tbwblur', onBlur);
    }

    if (onInit) {
      trumbowygInstance.on('tbwinit', onInit);
    }

    if (onChange) {
      trumbowygInstance.on('tbwchange', onChange);
    }

    if (onResize) {
      trumbowygInstance.on('tbwresize', onResize);
    }

    if (onPaste) {
      trumbowygInstance.on('tbwpaste', onPaste);
    }

    if (onOpenFullScreen) {
      trumbowygInstance.on('tbwopenfullscreen', onOpenFullScreen);
    }

    if (onCloseFullScreen) {
      trumbowygInstance.on('tbwclosefullscreen', onCloseFullScreen);
    }

    if (onClose) {
      trumbowygInstance.on('tbwclose', onClose);
    }

    $(`#${id}`).trumbowyg('html', data);
    $(`#${id}`).trumbowyg(disabled === true ? 'disable' : 'enable');
  }

  shouldComponentUpdate(nextProps) {
    return (
      nextProps.data !== this.props.data ||
      nextProps.disabled !== this.props.disabled
    );
  }

  componentDidUpdate() {
    $(`#${this.props.id}`).trumbowyg('html', this.props.data);
    $(`#${this.props.id}`).trumbowyg(
      this.props.disabled === true ? 'disable' : 'enable'
    );
  }

  componentWillUnmount() {
    $(`#${this.props.id}`).trumbowyg('destroy');
  }
}

Trumbowyg.defaultProps = {
  buttons: [
    ['viewHTML'],
    ['formatting'],
    'btnGrp-semantic',
    ['superscript', 'subscript'],
    ['link'],
    ['insertImage'],
    'btnGrp-justify',
    'btnGrp-lists',
    ['horizontalRule'],
    ['removeformat'],
    ['fullscreen']
  ],
  semantic: true,
  resetCss: false,
  removeformatPasted: false,
  autogrow: false,
  disabled: false,
  plugins: {}
};

Trumbowyg.propTypes = {
  id: PropTypes.string.isRequired,
  data: PropTypes.string.isRequired,
  lang: PropTypes.string,
  placeholder: PropTypes.string,
  buttons: PropTypes.array,
  semantic: PropTypes.bool,
  resetCss: PropTypes.bool,
  removeformatPasted: PropTypes.bool,
  autogrow: PropTypes.bool,
  disabled: PropTypes.bool,
  btnsDef: PropTypes.object,
  //event handlers
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onInit: PropTypes.func,
  onChange: PropTypes.func,
  onResize: PropTypes.func,
  onPaste: PropTypes.func,
  onOpenFullScreen: PropTypes.func,
  onCloseFullScreen: PropTypes.func,
  onClose: PropTypes.func,
  plugins: PropTypes.object
};

export default Trumbowyg;
