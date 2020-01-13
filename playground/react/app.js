const Link = ({ url, text }) => {
  return React.createElement(
    'p',
    {},
    [
      React.createElement('a', { href: url }, text),
    ],
  );
};

const App = () => {
  return React.createElement(
    'div',
    {},
    React.createElement('h1', {}, 'Links made with React'),
    React.createElement(
      Link,
      {
        url: 'http://hckrnews.com/',
        text: 'Hacker News',
      }
    ),
    React.createElement(
      Link,
      {
        url: 'http://arstechnica.com/',
        text: 'Ars Technica',
      },
    ),
    React.createElement(
      Link,
      {
        url: 'http://github.com/',
        text: 'GitHub',
      },
    ),
  );
};

ReactDOM.render(React.createElement(App), document.getElementById('root'));
