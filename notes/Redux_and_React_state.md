# React State Management with Redux

## Redux Basics

Redux stores the entire state tree of an application in one single state store (essentially a big JavaScript object). This allows for a simple hydration of the app to recreate any existing state (great for debugging or persisting state).

The state tree itself is never modified directly (or: mutated), instead actions are dispatched that deduce the new state tree only by taking in the action (typically comprising a type descriptor and some kind of payload) and the current state.

This mostly decouples the view (like React) from the state management, with the view only triggering actions for Redux.

### Actions

Actions are plain JS objects that are the only source of information for the store: they get dispatched and (usually) result in an update to the state tree. An action by convention contains a `type` property that defines the typ of operation to perform as well as an optional payload that 

```js
const INC_COUNTER = 'INC_COUNTER';

return {
  type: INC_COUNTER,
  payload: {
    amount: 1,
  },
};
```

Using a constant to define the action type string can help with safety, because a mistyped type string will be hard to catch while a mistyped constant name will throw an immediate error.

In larger applications, it will be useful to define _action creators_ (either bound or not, see the next section on `bindActionCreators`). An action creator is a function that will return a valid action object.

```js
const addCounterValue = amount => {
  return {
    type: COUNTER_ADD,
    payload: {
      amount,
    },
  };
};
```

### Reducers

While actions only describe _what_ should happen to the store, a _reducer_ specifies how exactly the store state changes. Reducers are required to be pure functions that take two arguments: the current state (or the previous state, both wordings would be correct) and the action. The return value of a reducer is the next state.

An initial state can be defined by providing the first argument with a default value.

```js
const initialState = {
  value: 0,
};

const reducer = (state = initialState, action) {
  if (action.type === 'INCREMENT') {
    return {
      value: state.value + 1,
    };
  } else {
    return state;
  }
};
```

Reducers should never ever have any side effects or mutate one of the arguments. The returned new state needs to be a new object and not a mutated version of the current state. This can be achieved by either using a library for immutable data structures (like _Immer_ which is used by the Redux Toolkit) or by cloning the state object with `Object.assign()` or the spread operator (`...state`). Be aware that both only do shallow copies.

It makes sense to create multiple reducers for different domains of the state (to keep responsibilities separated) and add them together later with `combineReducers` (see next section), since the store itself will receive just a single reducer.

## Redux API

Redux' API surface is actually pretty small and basically consists of five functions: `applyMiddleware`, `bindActionCreators`, `combineReducers`, `compose` and `createStore`.

### `compose`

`compose` is a helper function that takes one or more functions, with each function expecting a single argument and their respective return value provided as the argument for the function left of it.

### `createStore`

`createStore` creates a Redux store that holds the state tree. As its first argument it takes a reducer function (for creating the next state tree) and optionally an initial state and/or a store enhancer, the latter being used to enhance the store with additional capabilities (like middleware or other third-party packages).

The object returned by `createStore` provides several methods: `dispatch()` (for invoking the reducer), `subscribe()` (to subscribe to state changes) , `getState()` (for receiving the current state)  and `replaceReducer()` (to pass in a new reducer function).

```js
const reducer = (state, action) => {
  // treat state as immutable and create a new state object if needed, e.g. through using the spread operator
  // return { ...state, newProperty: action.payload }
  return state;
};

const store = redux.createStore(reducer, {});

store.dispatch({
  type: 'DO_A_THING',
});

const unsubscribe = store.subscribe(() => { }); // unsubscribe holds a function reference to unsubscribe (to prevent an obvious memory leak)
                                                // the subscribe callback is invoked every time a dispatch action happens

console.log(Object.keys(store)); // outputs the methods described above
console.log(store.getState()); // {}
```

### `combineReducers`

This allows us to create multiple reducers that change a sub-tree of the complete application state. The result is a single reducer function that can be passed as an argument to `createStore()`.

The overall state is namespaced according to the keys provided to the `combineReducers` call. Each reducer will only have access to the sub-tree of state according to the key used inside the object passed into `combineReducers`. It's important to note, though, that each dispatched action will still be passed into all the reducer functions.

```js
const counter = (state, action) => {
  // this will receive only the partial state tree for the counter
};
const user = (state, action) => {
  // this will receive only the partial state tree for the user
}

const reducer = combineReducers({
  counter,
  user
});

const store = createStore(reducer, {});
```

### `bindActionCreators` 

An _action creator_ is a method that returns a valid action to dispatch to a Redux store.

```js
const createAddAction = (amount) => {
  return {
    type: 'counter/add',
    payload: {
      amount
    }
  };
};
```

`bindActionCreator` (or the variant for multiple action creators, `bindActionCreators`) wraps such an 
action creator to automatically dispatch to a Redux store.

```js
const dispatchAdd = bindActionCreator(createAddAction, store.dispatch);
// returns a function that dispatches the action object without having to 
// pass the store or any Redux to a component
```

### `applyMiddleware`

Redux dispatches are forced to be pure functions, but any side effects can be executed through Redux middleware.

```js
const logger = ({ getState }) => {
  return next => action => {
    console.log('some middleware', getState(), action);
    return next(action);
  };
}

const store = createStore(reducer, applyMiddleware(logger));
```

This executes the logger for each dispatch call. Important is the continuation of the middleware chain by returning a
call to `next()` at the end of each middleware.

## Redux and React

To allow React components to read state from a Redux store or dispatch actions it, it needs some bindings. Otherwise, 
a React component has no way of executing a rerender when parts of the state tree change.

These bindings come with a small library that is aptly named `react-redux`. It provides two things: a `connect` method
and a `Provider` component.

The Provider is a wrapper component that allows any component in the tree below to access the Redux store. Therefore, the
`Provider` typically wraps the application's root level component.

```js
// create or import store

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'),
);
```

`connect` allows a component to access data from the Redux store and be able to trigger a rerender when that data changes. It
does so by mapping Redux store functionality to props that are usable (and observable) by React.

Both arguments to `connect` are optional.

The first one is a function `mapStateToProps` which will receive the complete state tree and should return an object of all 
the data that the component needs. The second argument to it is by convention called `ownProps` and will contain all other props
passed into the component, if thexy need to be used to figure out which data from the state to map to props.

The second argument is `mapDispatchToProps` and it takes either a function or an object as its argument. A function will receive
the store's `dispatch` as an argument and should return an object with methods that use `dispatch` to dispatch actions.
If the argument to `mapDispatchToProps` is an object, it should hold references to action creators, each of which will be turned
into a prop function that, when invoked, automatically dispatches the associated action correctly.

`connect` itself returns a function that is normally immediately invoked with the component itself as its sole argument.

```js
const mapStateToProps = (state, ownProps) => {
  return {
    user: state.user,
    view: state.views[ownProps.id],
  };
};

const mapDispatchToProps = dispatch => {
  return {
    update: dispatch({
      type: 'user/update',
      payload: 'better use some action creators here',
    }),
  };
};

connect(
  mapStateToProps, // typically a function
  mapDispatchToProps, // idiomatically an object of action creators
)(Component);
```

## Redux Dev Tools

The browser Redux Dev Tools allow inspection of the current state tree, dispatched actions and provide a full history of all actions
to enable step-by-step replay for debugging purposes.

To allow the dev tools to work, they need to be registered within the Redux store configuration.

```js
const store = createStore(
  reducer,
  preloadedState,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(), // as an enhancer like applyMiddleware, use compose() if there are multiple enhancers
);
```


