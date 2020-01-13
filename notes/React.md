# React.js

## Barebones React

In essence, React is a JavaScript library for building user interfaces. It follows a declarative, component-based model for that.

A **Component** is an encapsulated unit of functionality that uses _data_ (properties and an internal state) to render the user interface as output. Certain types of components also provide a set of _lifecycle methods_ to be hooked into.  
The core React library exposes functionality to create and configure those components. React can render to different outputs, but the most commonly used `react-dom` library allows for UI rendering of components to the browser DOM.

For that, React implements a _virtual DOM_ that sits between the application and the browser DOM. This virtual DOM uses a fast diffing algorithm to determine which parts of the browser DOM need to be updated, preventing unnecessary repainting and rerendering in the browser.

While React can be written as part of a complex ecosystem with many helpers (Webpack, Parcel, ...) or as part of a toolbox that does all these configuration for you (`create-react-app`), at its core, React needs just the two aforementioned libraries.

```html
<html>
  <head></head>
  <body>
    <div id="root">not yet rendered</div>
    <script src="https://unpkg.com/react@16.8.4/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@16.8.4/umd/react-dom.development.js"></script>
    <script>
      const App = () => {
        return React.createElement(
          'div',
          {},
          React.createElement('h1', {}, 'Hello React world!')
        );
      };

      ReactDOM.render(React.createElement(App), document.getElementById('root'));
    </script>
  </body>
</html>
```

In this case, `App` would represent a component, and every component needs to consist of a return value of `React.createElement()`. That method receives three arguments: 

1. a string (like `'div'` above) or a component (like `App` in the `render()` call)
2. the properties and attributes (like a `{ id: ''whatever' }` for the `div` above)
3. any children elements (either another `createElement()` call or a pre-defined component), can be an array or just multiple arguments

Properties are used to pass data into a component, like

```js
const Link = ({ url, text }) => {
  return React.createElement(
    'p', {}, React.createElement('a', { href: url }, text)
  );
};

React.createElement(Link, {
  url: 'http://hckrnews.com/',
  text: 'Hacker News',
});
```

## Basic Tooling

Besides the ubiquitous `create-react-app` (that uses Webpack internally and a lot of other tools), a light-weight (for JS standards!) alternative is Parcel (`yarn add parcel-bundler -D`).

With `parcel dev index.html`, parcel automatically bundles app all resources (HTML, CSS, JS) and creates a `dist` folder with the provided entry point and all other resources bundled together for production use. It also provides a hot-reloading development server for quick testing.

Organizing each component in a file is advised and will use ES6 import/export features.

```js
// list.js
export default newList();
// there can only ever be one default export in a file

// otherFile.js
import newList from './list';
// the name assigned when importing doesn't matter, it always imports the default export anyway
```

or

```js
// list.js
export const newList = () => { ... };

// otherFile.js
import { newList } from './list';
// importing non default exports requires curly braces for object destructuring
```

### JSX

JSX (_JavaScript Syntax eXtension_) extends ECMAScript and allows for writing HTML-like, tree syntax that can easily be converted by a pre-processor into valid JavaScript code.

```jsx
// Using JSX to express UI components.
// taken from https://facebook.github.io/jsx/
var dropdown =
  <Dropdown>
    A dropdown list
    <Menu>
      <MenuItem>Do Something</MenuItem>
      <MenuItem>Do Something Fun!</MenuItem>
      <MenuItem>Do Something Else</MenuItem>
    </Menu>
  </Dropdown>;

render(dropdown);
```

## Components, Props, State, Lifecycles

In React, props are immutable. To handle changing state, a special `state` object is introduced. That object can only be assigned to in the constructor function (when using the ES6 class syntax do define components). Otherwise, the explicit `this.setState()` method needs to be used.

Every component has a `render()` function that returns JSX.

In the lifecycle of a component, certain functions of a component will be executed at certain times. For example, `componentDidMount()` gets invoked once the component is actually added into the browser DOM. 

since both `this.state` and `this.props` for a component update asynchronously, any reliance on state or props in a `setState()` call bears a risk of those values not being what is expected.
`setState()` therefore has a second form that can receive a function with two arguments, the state and the props, with the state being the previous state and props being whatever props are at the time the update is actually executed.
Any update to `this.state` is shallow merged, so properties of the state object can be updated independently with separate `setState()` calls.

Any component can pass its state down to a child element (be that an HTML element or another React component), but not the other way around. Date flow in React is therefore uni-directional.

## Handling Events in React

In JSX a function can be passed as an event handler (events in React use camelCase notation).

```jsx
function engineStarter() {
  function startEngines(e) {
    e.preventDefault();
    console.og('Starting engines ...');
  }

  return (
    <button onClick={startEngines}>
      Start Engines
    </button>
  );
}
```

The event passed into the handler is a so-called _synthetic event_, which is essentially a React wrapper around the native JS event object with cross-browser compatiblity.

In class syntax components, `this` binding needs to be taken into account when defining event handlers. Normally, they would be defined as class methods.

```jsx
class Engine extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      engineStarted: false,
    };
  }

  startEngines() {
    this.setState(state => ({ engineStarted: !state.engineStarted }));
  }

  render() {
    return (
      <button onClick={this.startEngines}>
        ENGINES {this.engineStarted ? 'ON' : 'OFF'}
      </button>
    );
  }
}

render(React.createElement(Engine), document.getElementById('root'));
```

Here, the `this` used in `startEngines` when it is invoked will be `undefined`. To properly bind `this`, an explicit binding the constructor function is possible (`this.startEngines = this.startEngines.bind(this)`) or an arrow function can be specified inside the handler to prevent rebinding of `this` (`<button onClick={(e) => this.startEngines(e)}>`). The latter is not recommended since it creates a new callback for each rendering of the button.

## Lists and keys

If a component should render a list of elements, it works like this:

```jsx
render() {
  const todoItems = todos.map((todo) =>
    <li key={todo.id}>
      {todo.text}
    </li>
  );

  return (
    <ul>{todoItems}</ul>
  );
}
```

The key attribute should be specified whenever list items get created so that React can uniquely identify each one and determine if that element specifically needs to be updated in the future. Keys are not actually props on a list item component, so if the key is defined as a prop on a component and the key value is needed in that component, it should be passed in again under a different prop name.

## Forms

Typically, HTML forms manage their own internal state. React can be defined as the single source of truth for a form element by handling those element's events (like user input). It is then a so-called _controlled component_.

```jsx
class NameForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    alert('A name was submitted: ' + this.state.value);
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Name:
          <input type="text" value={this.state.value} onChange={this.handleChange} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}
```