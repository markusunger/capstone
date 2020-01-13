import React from 'react';

class Story extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      details: {},
    }
  }

  componentDidMount() {
    fetch(`https://hacker-news.firebaseio.com/v0/item/${this.props.storyId}.json`)
      .then(details => details.json())
      .then(details => {
        this.setState({ details });
      });
  }

  render() {
    const { details } = this.state;
    const url = details.url || '#';
    const title = details.title || 'Loading ...';

    return (
      <div className="box">
        <a href={url}>{title}</a>
      </div>
    )
  }
}

export default Story;
