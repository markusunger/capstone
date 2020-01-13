import React from 'react';
import { render } from 'react-dom';
import Story from './story';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stories: [],
    }
  }

  componentDidMount() {
    fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
      .then(topStories => topStories.json())
      .then(topStories => {
        const topTen = topStories.slice(0, 10);
        this.setState({
          stories: topTen,
        });
      }, (err) => console.log(err));
  }
    

  render() {
    return (
      <section className="section">
        <h1 className="title">Hacker News</h1>
        {this.state.stories.map(id => <Story key={id} storyId={id} />) }
      </section>
    )
  }
}

render(<App />, document.getElementById('root'));
