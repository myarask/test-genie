# test-genie

## Mission

To free developers from writing web app unit tests

## Concept

This project asserts that the purpose of web app unit tests is to protect against unintentional breaking changes to the user experience.
Examples of breaking changes include the removal of or logical alterations to:

- Conditional renders (Permissioned Content, Error/loading states)
- Interactive elements (Buttons, Links, Tabs, Inputs, etc)
- Interaction outcomes (Toggles, Filters)

In practice, automated or not, writing unit tests for React components boils down to a repeated process:

### Test Access Conditions of Conditional Renders

- mock the conditions which make the element accessible
- render the component
- assert the element's accessibility (visible or enabled)

### Test Restriction Conditions of Conditional Renders

- mock the conditions which make the element accessible
- render the component
- assert the element's inaccessibility (invisible or disabled)

### Test Outcomes from Interactive Elements

- mock the conditions which make the elements accessible (if any)
- render the component
- interact with the element (click)
- assert outcomes

## Implementation

Given the repetitive nature of writing React unit tests, a code generator script would be successful following this strategy:

[] Parse all dependencies and props used by the component
[] Parse all conditional renders in the component
[] Parse all interactive elements in the component
[] Determine the types of all dependencies and props
[] Compose list of deep conditional renders
[] Compose list of deep interactive elements
[] Compose list of shallow non-interactive conditional renders
[] Compose list of shallow interactive conditional renders
[] Compose list of required imports for testing tools (testing-library, userEvents)
[] Prepare access condition tests for each shallow non-interactive conditional render
[] Prepare restriction condition tests for each shallow non-interactive conditional render
[] Prepare outcome tests for each shallow interactive conditional render
[] Prepare empty tests for each deep interactive element
[] Prepare empty tests for each deep conditional render
[] Create test file
[] Write out import statements
[] Write out beforeAll mocks
[] Write out test suite description block
[] Write out test type description blocks
[] Write out all prepared tests
