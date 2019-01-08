import string from '../lang';

const actionHandlerKeys = {
  advice: {
    trash: 'empty-trash'
  },
  suggestion: {
    update: 'install-update'
  },
  question: {
    newDevice: {
      acceptKey: 'accept-device',
      denyKey: 'deny-device'
    }
  },
  success: {
    emailSent: 'view-message'
  }
};

const messagePriorities = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  TOP: 4
};

const messagesContent = {
  advice: {
    trash: {
      priority: messagePriorities.LOW,
      description: string.messages.trash.description,
      action: string.messages.trash.action,
      actionHandlerKey: actionHandlerKeys.advice.trash
    }
  },
  suggestion: {
    update: {
      priority: messagePriorities.TOP,
      description: string.messages.update.description,
      action: string.messages.update.action,
      actionHandlerKey: actionHandlerKeys.suggestion.update
    }
  },
  question: {
    newDevice: {
      priority: messagePriorities.HIGH,
      ask: string.messages.new_device,
      acceptHandlerKey: actionHandlerKeys.question.newDevice.acceptKey,
      denyHandlerKey: actionHandlerKeys.question.newDevice.denyKey
    }
  },
  success: {
    changePassword: {
      priority: messagePriorities.MEDIUM,
      description: string.messages.change_password.success.description
    },
    downloadFile: {
      priority: messagePriorities.MEDIUM,
      description: string.messages.download_file.success.description
    },
    emailSent: {
      priority: messagePriorities.MEDIUM,
      description: string.messages.emailSent.success.description,
      action: string.messages.emailSent.success.action,
      actionHandlerKey: actionHandlerKeys.success.emailSent
    },
    recoveryEmailChanged: {
      priority: messagePriorities.MEDIUM,
      description: string.messages.recovery_email_change.success.description
    },
    recoveryEmailLinkConfirmation: {
      priority: messagePriorities.MEDIUM,
      description:
        string.messages.recovery_email_link_confirmation.success.description
    },
    rememberSharePassphrase: {
      priority: messagePriorities.MEDIUM,
      description: string.messages.remember_share_passphrase.description
    },
    removeDevice: {
      priority: messagePriorities.MEDIUM,
      description: string.messages.remove_device.success.description
    },
    resetPasswordSendLink: {
      priority: messagePriorities.MEDIUM,
      description: string.messages.reset_password_send_link.success.description
    },
    twoFactorAuthTurnOff: {
      priority: messagePriorities.MEDIUM,
      description: string.messages.two_factor_auth_turn_off.description
    },
    manualSync: {
      priority: messagePriorities.MEDIUM,
      description: string.messages.manual_sync.description
    }
  },
  error: {
    changePassword: {
      priority: messagePriorities.MEDIUM,
      description: string.messages.change_password.error.description
    },
    downloadFile: {
      priority: messagePriorities.MEDIUM,
      description: string.messages.download_file.error.description
    },
    emailSent: {
      priority: messagePriorities.MEDIUM,
      description: string.messages.emailSent.error.description
    },
    fetchEmails: {
      priority: messagePriorities.MEDIUM,
      description: string.messages.fetchEmails.description
    },
    network: {
      priority: messagePriorities.HIGH,
      description: string.messages.network.description
    },
    recoveryEmailChanged: {
      priority: messagePriorities.MEDIUM,
      description: string.messages.recovery_email_change.error.description
    },
    recoveryEmailLinkConfirmation: {
      priority: messagePriorities.MEDIUM,
      description:
        string.messages.recovery_email_link_confirmation.error.description
    },
    removeDevice: {
      priority: messagePriorities.MEDIUM,
      description: string.messages.remove_device.error.description
    },
    removeThreads: {
      priority: messagePriorities.MEDIUM,
      description: string.messages.remove_threads.description
    },
    resetPasswordSendLink: {
      priority: messagePriorities.MEDIUM,
      description: string.messages.reset_password_send_link.error.description
    },
    sendOpenEvent: {
      priority: messagePriorities.MEDIUM,
      description: string.messages.send_open_event.description
    },
    unsendEmail: {
      priority: messagePriorities.MEDIUM,
      description: string.messages.unsend_email.description
    },
    unsendEmailExpired: {
      priority: messagePriorities.MEDIUM,
      description: string.messages.unsend_email_expired.description
    },
    updateLabels: {
      priority: messagePriorities.MEDIUM,
      description: string.messages.update_labels.description
    },
    updateThreadLabels: {
      priority: messagePriorities.MEDIUM,
      description: string.messages.update_thread_labels.description
    },
    updateUnreadThreads: {
      priority: messagePriorities.MEDIUM,
      description: string.messages.update_unread_threads.description
    }
  },
  establish: {
    internet: {
      priority: messagePriorities.TOP,
      description: string.messages.internet.description
    }
  },
  news: {
    announcement: {
      priority: messagePriorities.MEDIUM,
      description: ''
    }
  }
};

export { messagesContent as default, actionHandlerKeys, messagePriorities };
