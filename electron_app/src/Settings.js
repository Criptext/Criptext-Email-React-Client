const appSettings = {
  isFromStore: this.isFromStore,
  language: this.language,
  opened: this.opened,
  theme: this.theme,
  autoBackupEnable: this.autoBackupEnable,
  autoBackupFrequency: this.autoBackupFrequency,
  autoBackupLastDate: this.autoBackupLastDate,
  autoBackupLastSize: this.autoBackupLastSize,
  autoBackupNextDate: this.autoBackupNextDate,
  autoBackupPath: this.autoBackupPath,

  initialize({
    language,
    opened,
    theme,
    isFromStore,
    autoBackupEnable,
    autoBackupFrequency,
    autoBackupLastDate,
    autoBackupLastSize,
    autoBackupNextDate,
    autoBackupPath
  }) {
    this.isFromStore = isFromStore;
    this.language = language;
    this.opened = opened;
    this.theme = theme;
    this.autoBackupEnable = autoBackupEnable;
    this.autoBackupFrequency = autoBackupFrequency;
    this.autoBackupLastDate = autoBackupLastDate;
    this.autoBackupLastSize = autoBackupLastSize;
    this.autoBackupNextDate = autoBackupNextDate;
    this.autoBackupPath = autoBackupPath;
  },

  update({
    language,
    opened,
    theme,
    autoBackupEnable,
    autoBackupFrequency,
    autoBackupLastDate,
    autoBackupLastSize,
    autoBackupNextDate,
    autoBackupPath
  }) {
    this.language = language || this.language;
    this.opened = opened !== undefined ? opened : this.opened;
    this.theme = theme || this.theme;
    this.autoBackupEnable =
      autoBackupEnable !== undefined ? autoBackupEnable : this.autoBackupEnable;
    this.autoBackupFrequency = autoBackupFrequency || this.autoBackupFrequency;
    this.autoBackupLastDate = autoBackupLastDate || this.autoBackupLastDate;
    this.autoBackupLastSize = autoBackupLastSize || this.autoBackupLastSize;
    this.autoBackupNextDate = autoBackupNextDate || this.autoBackupNextDate;
    this.autoBackupPath = autoBackupPath || this.autoBackupPath;
  }
};

module.exports = appSettings;
