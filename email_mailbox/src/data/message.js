const actionHandlerKeys = {
  advice: {
    trash: 'empty-trash'
  },
  suggestion: {
    update: 'install-update'
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
      priority: messagePriorities.MEDIUM,
      description: 'A new version of Criptext is available!',
      action: 'Click here to Install Update',
      actionHandlerKey: actionHandlerKeys.suggestion.update
    }
  },
  question: {
    newDevice: {
      priority: messagePriorities.HIGH,
      ask: 'Are you trying to access from the DavidMac device?'
    }
  },
  success: {
    emailSent: {
      priority: messagePriorities.MEDIUM,
      description: 'Your message has been sent.',
      action: 'View message',
      actionHandlerKey: actionHandlerKeys.success.emailSent
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
    updateThreadLabels: {
      priority: messagePriorities.MEDIUM,
      description: 'Failed to update thread labels'
    },
    removeThreads: {
      priority: messagePriorities.MEDIUM,
      description: 'Failed to remove threads'
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
