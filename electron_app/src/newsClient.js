const NewsClient = require('@criptext/news-api-client');
const { NEWS_SERVER_URL } = require('./utils/const');
const mySettings = require('./Settings');

const client = new NewsClient({ url: NEWS_SERVER_URL });
const emptyResponse = { title: '', body: '', imageUrl: '' };

class newsClient {
  constructor() {
    this.client = client;
  }

  async getNews({ code }) {
    const language =
      mySettings.language === 'en'
        ? `${mySettings.language}-XX`
        : mySettings.language;
    try {
      const res = await this.client.getNews({ language, code });
      return res.status === 200 ? res.body : emptyResponse;
    } catch (error) {
      return emptyResponse;
    }
  }
}

module.exports = new newsClient();
