# Functional Components

## Concept

This project asserts that the purpose of web app unit tests is to protect against unintentional breaking changes to the user experience.
Examples of breaking changes include the removal of or logical alterations to:

- Conditional renders (Permissioned Content, Error/loading states)
- Interactive elements (Buttons, Links, Tabs, Inputs, etc)
- Interaction outcomes (Toggles, Filters)

In practice, automated or not, writing unit tests for React components boils down to a repeated process:

### Test Access Conditions of Conditional Renders

1. Mock the conditions which make the element accessible
2. Render the component
3. Assert the element's accessibility (visible/enabled)

### Test Restriction Conditions of Conditional Renders

1. mock the conditions which make the element accessible
2. render the component
3. assert the element's inaccessibility (invisible/disabled/readonly)

### Test Outcomes from Interactive Elements

- Mock the conditions which make the elements accessible (if any)
- Render the component
- Interact with the element (click/focus/type)
- Assert outcomes

## Examples
