import { connect } from 'react-redux';
import { loadLabels } from '../actions';
import SideBarView from '../components/SideBarWrapper';
import { IconLabels } from './../utils/const';
import { toLowerCaseWithoutSpaces } from './../utils/StringUtils';

const defineLabels = labels => {
  return labels.valueSeq().filter(element => element.get('type') === 'custom');
};

const defineSideBarItems = labels => {
  const sideBarItems = labels
    .valueSeq()
    .filter(label => label.get('visible'))
    .map(label => ({
      idText: toLowerCaseWithoutSpaces(label.get('text')),
      icon: IconLabels[label.get('id')]
        ? IconLabels[label.get('id')].icon
        : 'icon-tag',
      text: label.get('text'),
      badge: label.get('badge') || null
    }))
    .toJS();
  const allMailItem = {
    idText: toLowerCaseWithoutSpaces(IconLabels.allmail.text),
    icon: IconLabels.allmail.icon,
    text: IconLabels.allmail.text
  };
  return [...sideBarItems, allMailItem];
};

const mapStateToProps = state => {
  const labels = state.get('labels');
  return {
    items: defineSideBarItems(labels),
    labels: defineLabels(labels)
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLoadLabels: () => {
      dispatch(loadLabels(dispatch));
    }
  };
};

const SideBar = connect(mapStateToProps, mapDispatchToProps)(SideBarView);

export default SideBar;
