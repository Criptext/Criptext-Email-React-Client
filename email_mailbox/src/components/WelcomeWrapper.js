import React, { Component } from 'react';
import Welcome from './Welcome';

class WelcomeWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      articleSelected: 1
    };
  }

  render() {
    return (
      <Welcome
        {...this.props}
        articleSelected={this.state.articleSelected}
        onClickBackArticle={this.handleClickBackArticle}
        onClickNextArticle={this.handleClickNextArticle}
      />
    );
  }

  handleClickBackArticle = () => {
    this.setState({ articleSelected: this.state.articleSelected - 1 });
  };

  handleClickNextArticle = () => {
    this.setState({ articleSelected: this.state.articleSelected + 1 });
  };
}

export default WelcomeWrapper;
