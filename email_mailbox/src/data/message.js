export default {
  advice: {
    trash: {
      description:
        'Messages that have been in Trash more than 30 days will be automatically deleted.',
      action: 'Empty Trash'
    }
  },
  suggestion: {
    update: {
      description: 'A new version of Criptext is available!',
      action: 'Click here to Install Update'
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
      action: 'View message'
    }
  },
  error: {
    network: {
      description: 'Not connected, conecting in 10s',
      action: 'Try Now'
    }
  },
  establish: {
    internet: {
      description: 'Connection reestablished'
    }
  }
};
