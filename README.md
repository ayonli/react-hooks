# React Hooks

A group of react hooks that makes life easier.

This package currently include the following hooks, more hooks may be added in
the future.

- [useAsyncData](https://jsr.io/@ayonli/react-hooks/doc/~/useAsyncData)
  Asynchronously load remote data, usually used with {@link fetch} API.
- [useDebouncedCallback](https://jsr.io/@ayonli/react-hooks/doc/~/useDebouncedCallback)
  Returns a debounced function that can be used to reduce unnecessary calls.
- [usePropState](https://jsr.io/@ayonli/react-hooks/doc/~/usePropState) Uses a
  prop as the state in a component, and when the prop changes, the state will
  change accordingly.
- [useRerender](https://jsr.io/@ayonli/react-hooks/doc/~/useRerender) Returns a
  rerender function that can be used to trigger a rerender of the component
  manually.
- [useRevertibleState](https://jsr.io/@ayonli/react-hooks/doc/~/useRevertibleState)
  Adds additional functions to the `useState` hook, allowing us to undo and redo
  state changes.
- [useRouter](https://jsr.io/@ayonli/react-hooks/doc/~/useRouter) Manipulates
  route and retrieving route parameters.
- [useSubmit](https://jsr.io/@ayonli/react-hooks/doc/~/useSubmit) Submit data to
  a remote server and track the status of the request.
- [useUrlState](https://jsr.io/@ayonli/react-hooks/doc/~/useUrlState) Similar to
  `useState`, but persist the state to the URL query parameters.
