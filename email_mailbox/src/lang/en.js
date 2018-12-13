export default {
  header: {
    add_labels: 'Add labels',
    archive: 'Archive',
    delete: 'Delete',
    discard_drafts: 'Discard drafts',
    dismiss: 'Dismiss',
    move_to: 'Move to',
    move_to_inbox: 'Move to inbox',
    restore: 'Restore',
    search: 'search',
    search_options: {
      from: 'from',
      from_placeholder: 'People by name or email address',
      has_attachment: 'Has attachment',
      subject: 'subject',
      subject_placeholder: 'Enter a text',
      to: 'to',
      to_placeholder: 'People by name or email address'
    },
    selected: 'Selected',
    selected_plural: 'Selected'
  },
  labelsItems: {
    inbox: 'Inbox',
    spam: 'Spam',
    sent: 'Sent',
    starred: 'Starred',
    draft: 'Draft',
    trash: 'Trash',
    allmail: 'All Mail',
    search: 'Search'
  },
  mailbox: {
    all: 'all',
    empty: {
      search: {
        header: 'No search results',
        subheader: 'Trash & Spam emails are not displayed'
      },
      spam: {
        header: "There's no spam",
        subheader: 'Cool!'
      },
      default: {
        header: 'You have no emails yet',
        subheader: 'Send an email to get started'
      }
    },
    move_to_trash: 'Move to trash',
    not_starred: 'Not starred',
    starred: 'Starred',
    unread: 'unread'
  },
  settings: {
    change_password: 'change password',
    contact_support: 'Contact Support',
    disabled: 'disabled',
    enabled: 'enabled',
    general: 'general',
    language: 'language',
    name: 'name',
    notification_preview: 'notification preview',
    off: 'off',
    on: 'on',
    password: 'password',
    profile: 'profile',
    read_receipts: 'read receipts',
    resend_link: 'resend link',
    signature: 'Signature',
    trusted_devices: 'trusted devices',
    two_factor_authentication: 'two-factor authentication',
    delete_account: {
      label: 'Delete Account',
      button: 'Delete permanently'
    },
    manual_sync: {
      label: 'Manual Sync',
      button: 'Sync',
      tooltip: 'You must have at least one additional device to use Manual Sync'
    }
  },
  sidebar: {
    compose: 'compose',
    enter_new_label: 'enter new label',
    invite_a_friend: 'Invite a friend',
    labels: 'Labels',
    new_label: 'New label',
    settings: 'Settings'
  },
  messages: {
    change_password: {
      success: {
        description: 'Password changed'
      },
      error: {
        description:
          'Failed to change password. The password has not been modified'
      }
    },
    download_file: {
      success: {
        description: "Download successfully. Check your 'Downloads' folder"
      },
      error: {
        description: 'An error occurred during download. The file was not saved'
      }
    },
    emailSent: {
      success: {
        description: 'Your message has been sent.',
        action: 'View message'
      },
      error: {
        description: 'Failed to send your message'
      }
    },
    fetchEmails: {
      description:
        'Failed to fetch the emails. Check your connection and try again'
    },
    internet: {
      description: 'Connection reestablished'
    },
    network: {
      description: 'Not connected. Trying to reconnect'
    },
    new_device: {
      ask: 'Are you trying to access from'
    },
    recovery_email_change: {
      success: {
        description: 'Recovery email changed'
      },
      error: {
        description:
          'Failed to change recovery email. Check your connection and try again'
      }
    },
    recovery_email_link_confirmation: {
      success: {
        description: 'Confirmation link sent. Check your inbox and confirm'
      },
      error: {
        description: 'Failed to send confirmation link'
      }
    },
    remember_share_passphrase: {
      description:
        'Remember to send the passphrase to your non-Criptext recipients'
    },
    reset_password_send_link: {
      success: {
        description:
          'A reset link was sent to your recovery email. The link will be valid for 30 minutes'
      },
      error: {
        description:
          'You need to set and confirm a Recovery Email to reset your password'
      }
    },
    remove_device: {
      success: {
        description: 'Device removed'
      },
      error: {
        description: 'Failed to remove the device. Try again'
      }
    },
    remove_threads: {
      description: 'Error moving emails. Please try again'
    },
    send_open_event: {
      description: 'Failed to send open email. Try again'
    },
    trash: {
      description:
        'Messages that have been in Trash more than 30 days will be automatically deleted',
      action: 'Empty Trash'
    },
    two_factor_auth_turn_off: {
      description: 'Two-Factor Authentication was turned off'
    },
    unsend_email: {
      description: 'Failed to unsend the email. Unknown status code:'
    },
    unsend_email_expired: {
      description:
        'Failed to unsend the email. Time (1h) for unsending has already expired.'
    },
    update: {
      description: 'A new version of Criptext is available!',
      action: 'Click here to Download Update'
    },
    update_labels: {
      description: 'Failed updating labels. Please try again'
    },
    update_thread_labels: {
      description: 'Failed updating email labels. Please try again'
    },
    update_unread_threads: {
      description: 'Failed updating email status. Please try again'
    }
  },
  notification: {
    newEmailGroup: {
      prefix: 'You have ',
      sufix: ' new emails'
    }
  },
  popups: {
    account_deleted: {
      title: 'Account deleted',
      paragraphs: {
        header: 'Removing all data...'
      }
    },
    delete_account: {
      title: 'Delete My Account',
      paragraphs: {
        header: `Deleting your account will also delete all your emails in this and any other device in which your account is logged into. It will also enable anyone to register an account with your current email address.`
      },
      subtitle: 'To confirm enter your password',
      inputs: {
        password: {
          placeholder: 'Enter password',
          errorMessages: {
            length: {
              prefix: 'Must be at least',
              suffix: 'characters'
            },
            wrong: 'Wrong password'
          }
        }
      },
      cancelButtonLabel: 'Cancel',
      confirmButtonLabel: 'Send'
    },
    logout: {
      title: 'Logout',
      paragraphs: {
        header: 'Are you sure you want to logout?'
      },
      cancelButtonLabel: 'Cancel',
      confirmButtonLabel: 'Continue'
    },
    manual_sync: {
      title: 'Manual Sync',
      paragraphs: {
        header:
          'All your emails, contacts and labels of this device will be replaced with the information of the device which you confirm this operation',
        question: 'Would you like to proceed?'
      },
      cancelButtonLabel: 'Cancel',
      confirmButtonLabel: 'Confirm'
    }
  },
  userGuide: {
    buttonCompose: {
      text: 'Start by sending a new email',
      buttonLabel: 'Okay'
    },
    emailRead: {
      text: 'Looks like this email was read!',
      buttonLabel: 'Got it'
    },
    activityFeed: {
      text: 'See which emails have been read and by whom',
      buttonLabel: 'Okay'
    }
  }
};
