# React.js

## Barebones React

In essence, React is a JavaScript library for building user interfaces. It follows a declarative, component-based model for that.

A **Component** is an encapsulated unit of functionality that uses _data_ (properties and an internal state) to render the user interface as output. Certain types of components also provide a set of _lifecycle methods_ to be hooked into.  
The core React library exposes functionality to create and configure those components. React can render to different outputs, but the most commonly used `react-dom` library allows for UI rendering of components to the browser DOM.

For that, React implements a _virtual DOM_ that sits between the application and the browser DOM. This virtual DOM uses a fast diffing algorithm to determine which parts of the browser DOM need to be updated, preventing unnecessary repainting and rerendering in the browser.

While React can be written as part of a complex ecosystem with many helpers (Webpack, Parcel, Babel, etc.) or as part of a toolbox that does all these configuration for you (`create-react-app`), at its core, React needs just the two aforementioned libraries.

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

In React, JSX can be used to simplify the return value of the `render()` method.

```js
render() {
  return ( // with no parentheses, JS would auto-insert a semicolon after return here
    <div>
      <someComponent prop="someProp" />
    </div>
  )
}
```

The `render()` call should return only one top-level element (because internally it can only return one `React.createElement()` call, which is what JSX gets converted into). To not uselessly nest `div`'s, `<React.Fragment>` can be used as the top-level element. That fragment will not be represented in the browser DOM.

Comments in JSX can be created by wrapping a normal JS comment in curly braces (`{ /* a comment */}`).

A few normal HTML properties can't be used in JSX because they are regular JS keywords. The two most common cases are `class=""` and `for=""` (the latter mainly being used inside `label` tags). In those cases, there is a special JSX form: `className` and `htmlFor` for the two specified examples.

## Components, Props, State, Lifecycles

Props are to components what attributes are to regular HTML tags: additional data and information. Strings can be passed into a component exactly like attributes, every other value needs to be wrapped in curly braces:

```html
<someComponent stringProp="LS rocks" numProp={42} boolProp={false} />
```

In React, props are immutable. To handle changing state, a special `state` object is introduced. That object can only be assigned to in the constructor function (when using the ES6 class syntax do define components). Otherwise, the explicit `this.setState()` method needs to be used.

In the lifecycle of a component, certain functions of a component will be executed at certain times. For example, `componentDidMount()` gets invoked once the component is actually added into the browser DOM. 

Since both `this.state` and `this.props` for a component update asynchronously, any reliance on state or props in a `setState()` call bears a risk of those values not being what is expected.
`setState()` therefore has a second form that can receive a function with two arguments, the state and the props, with the state being the previous state and props being whatever props are at the time the update is actually executed.
Any update to `this.state` is shallow merged, so properties of the state object can be updated independently with separate `setState()` calls.

Any component can pass its state down to a child element (be that an HTML element or another React component) by passing it as that child's props, but not the other way around. Date flow in React is therefore uni-directional.

## Handling Events in React

In JSX a function can be passed as an event handler (events in React use camelCase notation).

```jsx
function engineStarter() {
  function startEngines(e) {
    e.preventDefault();
    console.log('Starting engines ...');
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

If there would just be a `value` provided to input inside of the component, this value would overwrite every input on each render. So an `onChange()` method is strictly required or the definition of a `defaultValue` attribute to the `input` element.

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

# React Hooks

Class-based component syntax for writing React had a few downsides: logic needed to be duplicated across different lifecycle methods, there was no way to mixin logic to components (except for HOCs which led to the dreaded wrapper hell) and there was the clunkiness of having to explicitly bind instance methods before they could be passed down as props.

All that was solved with function components using the new Hooks way of writing React.

## The `useState` hook

`useState()` takes a single argument (the initial state value) and returns an array with two elements: first, the current state value, the second, a method to update the state.

```js
const [theme, setTheme] = React.useState('light');

console.log(theme); // 'light'
setTheme('dark');
console.log(theme); // 'dark'
```

To be precise, the `useState` hook allows for the preservation of of values (via closures) between component renders and can trigger re-renders of it.

Beware: whenever setting the next state based on the current state, use the function invocation of the `useState` setter:

```js
const [count, setCount] = React.useState(0);
const increment = () => setCount((count) => count + 1);
```

If the initial state is the result of an expensive operation, it is recommended to pass a function as the `useState` argument:

```js
const [count, setCount] = React.useState(() => getExpensiveInitialCount());
```

That way, the expensive initial state is only invoked once instead of on each render.

## The `useEffect` hook

`useEffect` is used to implement side effects in function components. It has two arguments:

1. a function that specifies the side effect (e.g. an API call or basically every operation outside of React)
2. an array that specifies which values are observed to trigger the effect invocation (and therefore allows skipping the side effect)

The effect is invoked by React *after* the DOM updates (meaning after the component is rendered) to prevent the effect from blocking any rendering operation. By default, if there is no second argument to `useEffect`, the effect is executed after every single re-render. If the second argument is an empty array, the effect will only get invoked on the initial render, and if the array contains values, a change to those values determines whether the effect gets executed.

```js
function Profile({ username }) {
  const [profile, setProfile] = React.useState(null);

  React.useEffect(() => {
    getGithubProfile(username)
      .then(setProfile)
  }, [username]);
```

`useEffect` also provides a way to cleanup any lingering artifacts. When `useEffect` returns a function, React will execute that function right before the component gets removed from the DOM. Additionally, that function will get invoked when the component gets re-rendered, right before re-invoking the effect.

```js
import { subscribe, unsubscribe } from './api';

function Profile ({ username }) {
  const [profile, setProfile] = React.useState(null);

  React.useEffect(() => {
    subscribe(username, setProfile);
    return () => {
      unsubscribe(username);
      setProfile(null);
    }
  }, [username]);
```

## Custom Hooks

Custom hooks allow the extraction of component logic into reusable functions. They replace the traditional React way of using render props and higher-rder components.  
Custom hooks should always start with a `use` in their name. It may also call other hooks. Other than that, it is upon the programmer to decide what arguments a custom hook should take and what its return value is.

```js
function useFetch(url) {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    setLoading(true);

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setError(null);
        setLoading(false);
      })
      .catch((e) => {
        console.warn(e.message);
        setError('Error fetching data. Try again.');
        setLoading(false);
      });
  }, [url]);

  return { loading, data, error };
}
```

## Other hooks

The `useReducer` hook is useful to manage a components state with the same functional pattern that the vanilla JS method `reduce` provides. `useReducer`  takes two arguments: a function to determine the next state (called the reducer) and an initial state value. It returns the current state value and a dispatch method. The argument that dispatch receives will be passed as the second argument for the reducer function (the first argument for it being the current state).

```js
const [state, dispatch] = useReducer(reducer, initialState);
```

`useState` persists any value across component renders, but it inherently also triggers a re-render for each change of that value. If the goal is to persist a non-UI value that shouldn't trigger a new render step, the `useRef` hook can be used. 

```js
const refContainer = useRef(initialValue);
// ...
refContainer.current; // initialValue
```

One of the uses of refs is to access the DOM. Any ref object passed to React in the form of `<div ref={myCustomRef} />` will set the refs `current` property to the DOM node.

If a piece of data needs to be available throughout the component tree, it can either be passed down via props (cumbersome, if many components are involved) or be set as a _context_.  
`createContext` creates a context object. Each of these objects comes with a Provider component that allows consuming components to subscribe to changes to that context object.