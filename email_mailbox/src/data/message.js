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

const messagesContent = {
  advice: {
    trash: {
      description:
        'Messages that have been in Trash more than 30 days will be automatically deleted.',
      action: 'Empty Trash',
      actionHandlerKey: actionHandlerKeys.advice.trash
    }
  },
  suggestion: {
    update: {
      description: 'A new version of Criptext is available!',
      action: 'Click here to Install Update',
      actionHandlerKey: actionHandlerKeys.suggestion.update
    }
  },
  question: {
    newDevice: {
      ask: 'Are you trying to access from the DavidMac device?'
    }
  },
  success: {
    emailSent: {
      description: 'Your message has been sent.',
      action: 'View message',
      actionHandlerKey: actionHandlerKeys.success.emailSent
    },
    downloadFile: {
      description: "Download successfully. Check your 'Downloads' folder."
    }
  },
  error: {
    network: {
      description: 'Not connected, conecting in 10s',
      action: 'Try Now',
      actionHandlerKey: actionHandlerKeys.error.network
    },
    downloadFile: {
      description: 'An error occurred during download. The file was not saved.'
    }
  },
  establish: {
    internet: {
      description: 'Connection reestablished'
    }
  }
};

export { messagesContent as default, actionHandlerKeys };
