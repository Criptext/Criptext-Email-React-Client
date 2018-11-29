import { connect } from 'react-redux';
import { loadLabels } from '../actions';
import SideBarView from '../components/SideBarWrapper';
import { IconLabels, SectionType, composerEvents } from './../utils/const';
import { toLowerCaseWithoutSpaces } from './../utils/StringUtils';
import { openFilledComposerWindow } from './../utils/ipc';
import string from './../lang';

const defineLabels = labels => {
  return labels
    .valueSeq()
    .filter(
      element => element.get('type') === 'custom' && element.get('visible')
    );
};

const defineSideBarItems = labels => {
  const sideBarItems = labels
    .valueSeq()
    .filter(label => label.get('visible') && label.get('type') === 'system')
    .map(label => {
      const idText = toLowerCaseWithoutSpaces(label.get('text'));
      return {
        idText,
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
    idText: allMailIdText,
    icon: IconLabels.allmail.icon,
    text: string.labelsItems[allMailIdText]
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

const formInviteFriendEmailContent = () => {
  return '<!DOCTYPE html><html lang="en"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Hey, try Criptext now!</title><style type="text/css">.boton_1{text-decoration: none;padding: 8px;padding-left: 15px;padding-right: 15px;font-family: Avenir Next;font-weight: 500;font-size: 15px;color: #ffffff;background-color: #0091ff;border-radius: 26px;}.boton_1:hover{opacity: 0.9;text-decoration: none;}.boton_2{color: #0091ff}#criptext-website{color: #8FD8FF;text-decoration: none;}#confirm-button{color: #ffffff;}a:active, a:visited{color: #ffffff;}</style></head><body><div style="background-color: #F0F0F0; padding: 6%; max-width: 100%"><div style="background-color:#ffffff; padding-top:60px; padding-bottom: 60px; height:auto; max-width:100%; text-align: center; margin: 0 auto; font-family: avenir next;" ><div style="width: 80%; margin: 0 auto;"><div style="margin: 0 auto;"><img src="https://s3-us-west-2.amazonaws.com/web-res/Emails/header-icon.png" height="49px" ></div><div style="margin: 0 auto; padding-top:25px "><h2 style="color:#373a45; font-weight: 600; font-size: 23px; text-align: center">Hey, try Criptext now!</h2></div><div style="width: 100%; padding-top:20px "><p style="font-size: 15px; color:#9b9b9b; text-align: center">Criptext is an encrypted email service that guarantees security, privacy and control over all your email communications. We don‘t have access to your emails nor do we store them in our servers. <br/>You‘re in control now.</p></div><div style="margin: 0 auto; padding-top:30px" ><a id="confirm-button" href="http://www.criptext.com/dl" class="boton_1">Download</a></div></div></div><div style="max-width: 100%; margin: 5px auto; background-image: url(https://s3-us-west-2.amazonaws.com/web-res/Emails/footer-background.png); height: 110px; background-position: center top; background-repeat: no-repeat; background-size: auto 200%; font-family: avenir next; text-align: center;"><table style="width: 65%; margin: 0 auto; text-align: left; color: #ffffff; font-size: 13px; padding-top: 35px;"><tr><td style="font-weight: 600;">Encrypted. Private. Simple.<br><a href="https://criptext.com/" target="_blank" id="criptext-website" style="color: #8FD8FF; font-weight: 400;">www.criptext.com</a></td><td><a href="https://twitter.com/Criptext" target="_blank"><img src="https://s3-us-west-2.amazonaws.com/web-res/Emails/twitter.png" style="height: 18px;"></a></td><td><a href="https://medium.com/criptext" target="_blank"><img src="https://s3-us-west-2.amazonaws.com/web-res/Emails/medium.png" style="height: 18px;"></a></td><td><a href="https://www.instagram.com/criptext/" target="_blank"><img src="https://s3-us-west-2.amazonaws.com/web-res/Emails/instagram.png" style="height: 18px;"></a></td></tr></table></div></div></body></html>';
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onClickInviteFriend: () => {
      openFilledComposerWindow({
        type: composerEvents.NEW_WITH_DATA,
        data: {
          email: {
            subject: 'Hey, try Criptext now!',
            content: formInviteFriendEmailContent()
          }
        }
      });
    },
    onClickSettings: () => {
      const type = SectionType.SETTINGS;
      ownProps.onClickSection(type);
    },
    onLoadLabels: () => {
      dispatch(loadLabels(dispatch));
    }
  };
};

const SideBar = connect(
  mapStateToProps,
  mapDispatchToProps
)(SideBarView);

export default SideBar;
