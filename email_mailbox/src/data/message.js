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
  },
  error: {
    network: 'try-reconnect'
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
      description:
        'Messages that have been in Trash more than 30 days will be automatically deleted',
      action: 'Empty Trash',
      actionHandlerKey: actionHandlerKeys.advice.trash
    }
  },
  suggestion: {
    update: {
      priority: messagePriorities.TOP,
      description: 'A new version of Criptext is available!',
      action: 'Click here to Download Update',
      actionHandlerKey: actionHandlerKeys.suggestion.update
    }
  },
  question: {
    newDevice: {
      priority: messagePriorities.HIGH,
      ask: 'Are you trying to access from',
      acceptHandlerKey: actionHandlerKeys.question.newDevice.acceptKey,
      denyHandlerKey: actionHandlerKeys.question.newDevice.denyKey
    }
  },
  success: {
    emailSent: {
      priority: messagePriorities.MEDIUM,
      description: 'Your message has been sent.',
      action: 'View message',
      actionHandlerKey: actionHandlerKeys.success.emailSent
    },
    rememberSharePassphrase: {
      priority: messagePriorities.MEDIUM,
      description:
        'Remember to send the passphrase to your non-Criptext recipients'
    },
    downloadFile: {
      priority: messagePriorities.MEDIUM,
      description: "Download successfully. Check your 'Downloads' folder"
    },
    removeDevice: {
      priority: messagePriorities.MEDIUM,
      description: 'Device removed'
    },
    changePassword: {
      priority: messagePriorities.MEDIUM,
      description: 'Password changed'
    },
    recoveryEmailChanged: {
      priority: messagePriorities.MEDIUM,
      description: 'Recovery email changed'
    },
    recoveryEmailLinkConfirmation: {
      priority: messagePriorities.MEDIUM,
      description: 'Confirmation link sent. Check your inbox and confirm'
    },
    twoFactorAuthTurnOff: {
      priority: messagePriorities.MEDIUM,
      description: 'Two-Factor Authentication was turned off'
    }
  },
  error: {
    network: {
      priority: messagePriorities.TOP,
      description: 'Not connected, conecting in 10s',
      action: 'Try Now',
      actionHandlerKey: actionHandlerKeys.error.network
    },
    downloadFile: {
      priority: messagePriorities.MEDIUM,
      description: 'An error occurred during download. The file was not saved'
    },
    failedToSend: {
      priority: messagePriorities.MEDIUM,
      description: 'Failed to send your message'
    },
    updateLabels: {
      priority: messagePriorities.MEDIUM,
      description: 'Error updating labels. Please try again'
    },
    updateThreadLabels: {
      priority: messagePriorities.MEDIUM,
      description: 'Error updating email labels. Please try again'
    },
    updateUnreadThreads: {
      priority: messagePriorities.MEDIUM,
      description: 'Error updating email status. Please try again'
    },
    removeThreads: {
      priority: messagePriorities.MEDIUM,
      description: 'Error moving emails. Please try again'
    },
    fetchEmails: {
      priority: messagePriorities.MEDIUM,
      description:
        'Failed to fetch the emails. Check your connection and try again'
    },
    removeDevice: {
      priority: messagePriorities.MEDIUM,
      description: 'Failed to remove the device. Try again'
    },
    changePassword: {
      priority: messagePriorities.MEDIUM,
      description:
        'Failed to change password. The password has not been modified'
    },
    recoveryEmailChanged: {
      priority: messagePriorities.MEDIUM,
      description:
        'Failed to change recovery email. Check your connection and try again'
    },
    recoveryEmailLinkConfirmation: {
      priority: messagePriorities.MEDIUM,
      description: 'Failed to send confirmation link'
    },
    sendOpenEvent: {
      priority: messagePriorities.MEDIUM,
      description: 'Failed to send open email. Try again'
    },
    unsendEmail: {
      priority: messagePriorities.MEDIUM,
      description: 'Failed to unsend the email. Unknow status code:'
    },
    unsendEmailExpired: {
      priority: messagePriorities.MEDIUM,
      description:
        'Failed to unsend the email. Time (1h) for unsending has already expired.'
    }
  },
  establish: {
    internet: {
      priority: messagePriorities.TOP,
      description: 'Connection reestablished'
    }
  }
};

export { messagesContent as default, actionHandlerKeys };
