import { createSelector } from 'reselect';
import { IconLabels } from './../utils/const';
import { toLowerCaseWithoutSpaces } from './../utils/StringUtils';
import string from './../lang';

const getLabels = state => state.get('labels');

const defineLabels = labels => {
  return labels
    .valueSeq()
    .filter(label => label.get('type') === 'custom' && label.get('visible'))
    .map(label => {
      return {
        id: label.get('id'),
        color: label.get('color'),
        text: label.get('text')
      };
    });
};

const defineSideBarItems = labels => {
  const sideBarItems = labels
    .valueSeq()
    .filter(label => label.get('visible') && label.get('type') === 'system')
    .map(label => {
      const idText = toLowerCaseWithoutSpaces(label.get('text'));
      return {
        id: label.get('id'),
        icon: IconLabels[label.get('id')]
          ? IconLabels[label.get('id')].icon
          : 'icon-tag',
        text: string.labelsItems[idText],
        badge: label.get('badge') || null
      };
    })
    .toJS();
  const allMailIdText = toLowerCaseWithoutSpaces(IconLabels.allmail.text);
  const allMailItem = {
    id: -1,
    icon: IconLabels.allmail.icon,
    text: string.labelsItems[allMailIdText]
  };
  return [...sideBarItems, allMailItem];
};

export const getSystemLabels = createSelector([getLabels], labels =>
  defineSideBarItems(labels)
);

export const getVisibleLabels = createSelector([getLabels], labels =>
  defineLabels(labels)
);
