import { connect } from 'react-redux';
import SettingsContainer from './../components/SettingsContainer';
import { updateLabel, removeLabel } from './../actions';
import { myAccount } from '../utils/electronInterface';
import {
  cleanDataLogout,
  getUserSettings,
  logout,
  logoutApp,
  removeDevice,
  resetPassword,
  getAlias,
  getCustomDomain,
  deleteCustomDomains,
  deleteAliases,
  updateAlias,
  createAlias,
  createCustomDomain
} from './../utils/ipc';
import { appDomain, SectionType } from '../utils/const';
import { defineLastDeviceActivity } from '../utils/TimeUtils';
import { clearStorage } from '../utils/storage';
import {
  sendResetPasswordSendLinkSuccessMessage,
  sendResetPasswordSendLinkErrorMessage
} from '../utils/electronEventInterface';
import string from '../lang';

const mapStateToProps = () => {
  return {};
};

const formatDevicesData = devices => {
  return devices
    .map(device => {
      return {
        name: device.deviceFriendlyName,
        type: device.deviceType,
        deviceId: device.deviceId,
        lastConnection: {
          place: null,
          time: device.lastActivity.date
            ? defineLastDeviceActivity(device.lastActivity.date)
            : string.settings.over_time
        },
        isCurrentDevice: device.deviceId === myAccount.deviceId
      };
    })
    .sort(device => !device.isCurrentDevice);
};

const checkAddressesAndDomains = async addresses => {
  if (!addresses) return;

  const aliasinDb = await getAlias({});
  const customDomainsinDb = await getCustomDomain({});

  const aliasesInApi = addresses
    .map(address => {
      const domainName = address.domain.name;
      return address.aliases.map(alias => {
        return {
          name: alias.name,
          rowid: alias.addressId,
          active: alias.status,
          domain: domainName
        };
      });
    })
    .flat();
  const domainsInApi = addresses
    .map(address => address.domain)
    .filter(domain => domain.name !== appDomain);

  if (domainsInApi.length !== customDomainsinDb.length) {
    if (domainsInApi.length > customDomainsinDb.length) {
      await Promise.all(
        domainsInApi.map(async domain => {
          const customDomainsinDbExist = customDomainsinDb.find(
            domainInDb => domain.name === domainInDb.name
          );
          if (!customDomainsinDbExist) {
            const params = {
              name: domain.name,
              validated: domain.confirmed === 1
            };
            await createCustomDomain(params);
          }
        })
      );
    } else if (customDomainsinDb.length > domainsInApi.length) {
      const customDomainsToDelete = customDomainsinDb
        .filter(domain => {
          const domainsInApiExist = domainsInApi.map(
            domainInApi => domainInApi.name === domain.name
          );
          return !domainsInApiExist;
        })
        .map(domain => domain.name);
      await deleteCustomDomains(customDomainsToDelete.filter(e => e));
    }
  }

  if (aliasesInApi.length !== aliasinDb.length) {
    if (aliasesInApi.length > aliasinDb.length) {
      await Promise.all(
        aliasesInApi.map(async aliasInApi => {
          const aliasInDbExist = aliasinDb.find(
            aliasInDB => aliasInDB.rowid === aliasInApi.rowid
          );
          if (!aliasInDbExist) {
            const alias = {
              rowId: aliasInApi.rowid,
              name: aliasInApi.name,
              domain:
                aliasInApi.domain === appDomain ? null : aliasInApi.domain,
              active: aliasInApi.active === 1
            };
            await createAlias(alias);
          } else if (
            aliasInDbExist &&
            // eslint-disable-next-line eqeqeq
            aliasInDbExist.active != aliasInApi.active
          ) {
            // make an update
            await updateAlias({
              rowId: aliasInDbExist.rowId,
              active: !aliasInDbExist.active
            });
          }
        })
      );
    } else if (aliasinDb.length > aliasesInApi.length) {
      const aliasToDelete = aliasinDb
        .filter(aliasInDB => {
          const aliasInApiExist = aliasesInApi.find(
            aliasInApi => aliasInApi.rowid === aliasInDB.rowId
          );
          return !aliasInApiExist;
        })
        .map(alias => alias.rowId);
      await deleteAliases({ rowIds: aliasToDelete.filter(e => e) });
    }
  }
};

const deleteDeviceData = async (onUpdateApp, onClickSection) => {
  clearStorage({});
  const nextAccount = await cleanDataLogout({
    recipientId: myAccount.recipientId
  });
  if (nextAccount) {
    const { id, recipientId } = nextAccount;
    const mailbox = {
      id: 1,
      text: 'Inbox'
    };
    onClickSection(SectionType.MAILBOX, { mailboxSelected: mailbox });
    onUpdateApp({ mailbox, accountId: id, recipientId });
    return;
  }
  await logoutApp();
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onDeleteDeviceData: async () => {
      await deleteDeviceData(ownProps.onUpdateApp, ownProps.onClickSection);
    },
    onGetUserSettings: async () => {
      const settings = await getUserSettings();
      const {
        devices,
        addresses,
        recoveryEmail,
        twoFactorAuth,
        recoveryEmailConfirmed,
        readReceiptsEnabled,
        replyTo
      } = settings;

      await checkAddressesAndDomains(addresses); //syncro

      const aliases = addresses.reduce((result, domainWithAliases) => {
        const myAliases = domainWithAliases.aliases.map(alias => {
          return {
            name: alias.name,
            active: !!alias.status,
            rowId: alias.addressId,
            domain: domainWithAliases.domain.name
          };
        });
        return [...result, ...myAliases];
      }, []);

      const customDomains = addresses
        .map(address => address.domain)
        .filter(domain => domain.name !== appDomain);

      return {
        aliases,
        customDomains,
        devices: formatDevicesData(devices),
        recoveryEmail,
        twoFactorAuth,
        recoveryEmailConfirmed,
        readReceiptsEnabled,
        replyToEmail: replyTo
      };
    },
    onLogout: async () => {
      const res = await logout();
      return res.status === 200;
    },
    onRemoveLabel: (labelId, labelUuid) => {
      dispatch(removeLabel(String(labelId), labelUuid));
    },
    onRemoveDevice: async params => {
      const { status } = await removeDevice(params);
      return status === 200;
    },
    onUpdateLabel: params => {
      dispatch(updateLabel(params));
    },
    onResetPassword: async () => {
      const [recipientId, domain] = myAccount.recipientId.split('@');
      const params = {
        recipientId,
        domain: domain || appDomain
      };
      const { status } = await resetPassword(params);
      if (status === 200) {
        sendResetPasswordSendLinkSuccessMessage();
        return;
      }
      sendResetPasswordSendLinkErrorMessage();
    }
  };
};

const SettingsCont = connect(mapStateToProps, mapDispatchToProps)(
  SettingsContainer
);

export { SettingsCont as default, deleteDeviceData };
