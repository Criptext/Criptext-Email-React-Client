import { createSelector } from 'reselect';
import { IconLabels, sidebarItemsOrder } from './../utils/const';
import { toLowerCaseWithoutSpaces } from './../utils/StringUtils';
import { LabelType } from '../utils/electronInterface';
import string from './../lang';

const getLabels = state => state.get('labels');

const getThreadLabels = (state, getLabelIdsFromThreadIds) =>
  getLabelIdsFromThreadIds;

const getLabelIds = (state, props) => props.labelIds;

const defineLabels = (labels, labelIds) => {
  const labelIdsFiltered = labelIds.filter(
    labelId => labelId !== LabelType.sent.id
  );
  const result = labelIdsFiltered
    .map(labelId => {
      const label = labels.get(`${labelId}`);
      if (!label) return null;
      const text = label.get('text');
      return {
        id: label.get('id'),
        color: label.get('color'),
        text:
          label.get('type') === 'system'
            ? string.labelsItems[toLowerCaseWithoutSpaces(text)]
            : text
      };
    })
    .filter(item => item !== null);
  return result ? result : [];
};

const defineAllLabels = labels => {
  return labels.toArray().map(label => {
    const text = label.get('text');
    return {
      id: label.get('id'),
      text:
        label.get('type') === 'system'
          ? string.labelsItems[toLowerCaseWithoutSpaces(text)]
          : text
    };
  });
};

const defineCustomLabels = labels => {
  return labels
    .valueSeq()
    .filter(label => label.get('type') === 'custom')
    .toJS();
};

const defineSideBarItems = labels => {
  const sideBarItems = sidebarItemsOrder.map(id => {
    const label = labels.get(`${id}`);
    if (!label) return {};
    const idText = toLowerCaseWithoutSpaces(label.get('text'));
    return {
      id: label.get('id'),
      icon: IconLabels[label.get('id')]
        ? IconLabels[label.get('id')].icon
        : 'icon-tag',
      text: string.labelsItems[idText],
      badge: label.get('badge') || null
    };
  });
  const allMailIdText = toLowerCaseWithoutSpaces(IconLabels.allmail.text);
  const allMailItem = {
    id: -1,
    icon: IconLabels.allmail.icon,
    text: string.labelsItems[allMailIdText]
  };
  return [...sideBarItems, allMailItem];
};

const defineSystemLabelsToEdit = labels => {
  return labels
    .filter(label => {
      return label.get('id') === LabelType.starred.id;
    })
    .map(label => {
      const text =
        string.labelsItems[toLowerCaseWithoutSpaces(label.get('text'))];
      return { id: label.get('id'), text, visible: label.get('visible') };
    });
};

const defineVisibleLabels = labels => {
  return labels
    .valueSeq()
    .filter(label => label.get('type') === 'custom' && label.get('visible'))
    .map(label => {
      return {
        id: label.get('id'),
        color: label.get('color'),
        text: label.get('text'),
        type: label.get('type'),
        uuid: label.get('uuid')
      };
    });
};

const defineLabelsIncluded = (labels, threadLabels) => {
  const filteredLabels = labels.filter(item => {
    const isStarred = item.get('id') === LabelType.starred.id;
    const isCustomAndVisible =
      item.get('type') === 'custom' && item.get('visible');
    return isStarred || isCustomAndVisible;
  });

  if (!threadLabels) return [];
  const hasLabels = threadLabels.reduce((lbs, label) => {
    if (!lbs[label]) {
      lbs[label] = 1;
    } else {
      lbs[label]++;
    }
    return lbs;
  }, {});

  return filteredLabels.reduce((lbs, label) => {
    const labelId = label.get('id');
    const labelText = label.get('text');
    let checked = 'none';
    if (hasLabels[labelId]) {
      checked = 'all';
    }
    lbs.push({
      id: labelId,
      text: labelText,
      checked
    });
    return lbs;
  }, []);
};

export const getAllLabels = createSelector([getLabels], labels =>
  defineAllLabels(labels)
);

export const getCustomeLabels = createSelector([getLabels], labels =>
  defineCustomLabels(labels)
);

export const getLabelsIncluded = createSelector(
  [getLabels, getThreadLabels],
  (labels, threadLabels) => defineLabelsIncluded(labels, threadLabels)
);

export const getSystemLabels = createSelector([getLabels], labels =>
  defineSideBarItems(labels)
);

export const getSystemLabelToEdit = createSelector([getLabels], labels =>
  defineSystemLabelsToEdit(labels)
);

export const getVisibleLabels = createSelector([getLabels], labels =>
  defineVisibleLabels(labels)
);

export const makeGetLabels = () => {
  return createSelector([getLabels, getLabelIds], (labels, labelIds) =>
    defineLabels(labels, labelIds)
  );
};
