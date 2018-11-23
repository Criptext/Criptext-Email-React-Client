const appSettings = {
  language: this.language,
  opened: this.opened,
  theme: this.theme,

  initialize({ language, opened, theme }) {
    this.language = language;
    this.opened = opened;
    this.theme = theme;
  },

  update({ language, opened, theme }) {
    this.language = language || this.language;
    this.opened = opened !== undefined ? opened : this.opened;
    this.theme = theme || this.theme;
  }
};

module.exports = appSettings;
