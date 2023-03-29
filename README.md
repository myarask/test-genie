# Test Genie

## Mission

To lift the burden of unit testing from web developers

## Quick Start

The test genie CLI will create test files for any files matching the glob pattern. The tgen CLI will closely resemble the eslint CLI.

### Creating tests for a file

```sh
npx tgen MyComponent.tsx
```

### Creating tests for a project

```sh
npx tgen .
```

## Concept

This project asserts that the purpose of web app unit tests is to protect against unintentional breaking changes to the user experience.

> In frontend apps, a breaking change occurs when any interactive element is removed or altered. (relocation is not a breaking change).

> In backend apps, a breaking change occurs when any piece of an API contract is removed or altered. (adding to the contract is not a breaking change).

The key to preventing breaking changes is to track the interactive elements and API contracts. Procedurally generated unit tests are excellent at tracking breaking changes. For example, if a PR includes the removal of a procedurally generated test, the PR is guaranteed to include breaking changes.

## What about human and AI generated tests?

Script generated tests will always have the same output to each input. This is an advantage that human and AI generated tests don't have.

However, there is no reason why a developer should have to choose between them. It is viable to use all three sources for redundancy.

```
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

```
[] Capable of testing functional components
[] Beta published to npm
```

### Beta

```
[] Capable of testing hooks
[] Capable of testing REST controllers
[] Capable of testing GraphQL resolvers
[] Online documentation
[] v1 published to npm
```

### 1.0.0

```
[] Pipeline integrations
[] Breaking-change detection
[] Custom eslint plugins

etc...
```
