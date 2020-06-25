import { connect } from 'react-redux';
import SettingsContainer from './../components/SettingsContainer';
import { updateLabel, removeLabel, reloadAccounts } from './../actions';
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
  updateAccount,
  updateAlias,
  createAlias,
  createCustomDomain,
  updateCustomDomain,
  logError
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

  const aliasinDb = await getAlias({ accountId: myAccount.id });
  const customDomainsinDb = await getCustomDomain({ accountId: myAccount.id });

  let aliasesInApi = addresses
    .map(address => {
      const domainName = address.domain.name;
      return address.aliases.map(alias => {
        return {
          name: alias.name,
          rowId: alias.addressId,
          active: alias.status ? true : false,
          domain: domainName
        };
      });
    })
    .flat();
  const domainsInApi = addresses
    .map(address => address.domain)
    .filter(domain => domain.name !== appDomain);
  const domainsToCreate = [];
  const domainsToUpdate = [];
  const myApiDomains = new Set();
  for (const apiDomain of domainsInApi) {
    myApiDomains.add(apiDomain.name);

    const localDomain = customDomainsinDb.find(
      domain => apiDomain.name === domain.name
    );
    if (!localDomain) {
      domainsToCreate.push({
        ...apiDomain,
        accountId: myAccount.accountId
      });
    } else if (localDomain.validated !== apiDomain.confirmed) {
      domainsToUpdate.push({
        name: localDomain.name,
        validated: apiDomain.confirmed,
        accountId: myAccount.id
      });
    }
  }
  const domainsToDelete = customDomainsinDb
    .filter(domain => !myApiDomains.has(domain.name))
    .map(domain => domain.name);

  const aliasesToUpdate = [];
  const aliasesToDelete = [];
  for (const localAlias of aliasinDb) {
    if (localAlias.domain !== appDomain && myApiDomains.has(localAlias.domain))
      continue;
    const apiAlias = aliasesInApi.find(
      alias => localAlias.rowId === alias.rowId
    );
    if (!apiAlias) {
      aliasesToDelete.push(localAlias.rowId);
    } else if (localAlias.active !== apiAlias.active) {
      aliasesToUpdate.push({
        rowId: localAlias.rowId,
        active: apiAlias.active,
        accountId: myAccount.id
      });
    }
    aliasesInApi = aliasesInApi.filter(
      alias => alias.rowId !== localAlias.rowId
    );
  }
  const aliasesToCreate = aliasesInApi.map(alias => ({
    ...alias,
    domain: alias.domain === appDomain ? null : alias.domain,
    accountId: myAccount.id
  }));

  await Promise.all(
    [
      domainsToCreate.map(createCustomDomain),
      domainsToUpdate.map(updateCustomDomain),
      domainsToDelete.length > 0 ? deleteCustomDomains(domainsToDelete) : [],
      aliasesToCreate.map(createAlias),
      aliasesToUpdate.map(updateAlias),
      aliasesToDelete.length > 0
        ? deleteAliases({ rowIds: aliasesToDelete, accountId: myAccount.id })
        : []
    ].flat()
  );
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
        blockRemoteContent,
        addresses,
        customerType,
        recoveryEmail,
        twoFactorAuth,
        recoveryEmailConfirmed,
        readReceiptsEnabled,
        replyTo
      } = settings;

      if (customerType !== myAccount.customerType) {
        await updateAccount({
          recipientId: myAccount.recipientId,
          customerType
        });
        dispatch(reloadAccounts());
      }

      try {
        await checkAddressesAndDomains(addresses);
      } catch (ex) {
        logError(ex.stack);
      }

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
        blockRemoteContent,
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
