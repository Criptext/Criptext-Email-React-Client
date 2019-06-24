import { connect } from 'react-redux';
import ActivityPanelShortCutView from '../components/ActivityPanelShortCut';

const mapStateToProps = state => {
  const feedItems = state.get('feeditems');
  const badge = feedItems.get('badge');
  return {
    badge
  };
};

const ActivityPanelShortCut = connect(mapStateToProps)(
  ActivityPanelShortCutView
);

export default ActivityPanelShortCut;
