# Test Genie

## Mission

To lift the burden of unit testing from web developers

## Quick Start

The CLI can be run in development mode. By default, it will write tests for React components under the `samples` directory.

```sh
npm install
npm start
```

## Concept

This project asserts that the purpose of web app unit tests is to protect against unintentional breaking changes to the user experience.

> In frontend apps, a breaking change occurs when any interactive element is removed or altered. (relocation is not a breaking change).
> In backend apps, a breaking change occurs when any piece of an API contract is removed or altered. (adding to the contract is not a breaking change).

The key to preventing breaking changes is to track the interactive elements and API contracts. Procedurally generated unit tests are excellent at tracking breaking changes. For example, if a PR includes the removal of a procedurally generated test, the PR is guaranteed to include breaking changes.

## What about human and AI generated tests?

Script generated tests will always have the same output to each input. This is an advantage that human and AI generated tests don't have.

However, there is no reason why a developer should have to choose between them. It is viable to use all three sources for redundancy.

```text
├── src
│ ├── components
│ │ ├── MyComponent
│ │ │ ├──index.ts
│ │ │ ├──MyComponent.tsx
│ │ │ ├──MyComponent.test.tsx
│ │ │ ├──MyComponent.tgen.test.tsx
│ │ │ ├──MyComponent.ai.test.tsx
```

## Roadmap

### Alpha

```text
[] Capable of testing functional components
[] Capable of testing hooks
[] published to npm
```

### Beta

```text
[] Harden against production application
[] Online documentation
```

### Post-Release

```text
[] Capable of testing Class Components
[] Capable of testing functions
[] Capable of testing classes
```
