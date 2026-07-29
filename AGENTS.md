# Copilot instructions for jcontent

These instructions apply to every Copilot request in this repository. Follow them strictly.

## General

- This is a Jahia module (`@jahia/jcontent`) — React 18 frontend in `src/javascript/`, Java backend in `src/main/java/`, Cypress E2E in `tests/`.
- Package manager is **Yarn 4** (see `packageManager` in `package.json`). Use `yarn`, never `npm`, when suggesting commands.
- Always run the appropriate linter/formatter mentally before producing code; the produced code MUST pass `yarn lint` with zero warnings.

## JavaScript / JSX style

The repo extends `@jahia/eslint-config` (`.eslintrc.json`). Key rules to always honor:

- **Strict equality only**: use `===` and `!==`. **Never** use `==` or `!=`, even when comparing to `null`/`undefined`.
  - To check "null or undefined", prefer `value == null` is **NOT allowed** — instead use `value === null || value === undefined`, or simply `!value` when truthy/falsy semantics are acceptable.
- **Prefer optional chaining** over negation guards for null/undefined property access. Use `obj?.prop` instead of `!obj || obj.prop` patterns.
- **Prefer the `Number` static methods** over the global functions: always use `Number.parseInt`, `Number.parseFloat`, `Number.isNaN`, `Number.isFinite` instead of the globals `parseInt`, `parseFloat`, `isNaN`, `isFinite` (flagged by SonarQube).
- 4-space indentation. No tabs.
- Single quotes for strings. Backticks only for template literals.
- Always include semicolons.
- Use `const` by default; `let` only when reassignment is required. Never use `var`.
- Arrow functions for callbacks; named `function` declarations only when hoisting is needed.
- Destructure props and state where it improves readability.
- Boolean prop names must match `^((is|has)[A-Z]([A-Za-z0-9]?)+|allow|hide|show)` (per `react/boolean-prop-naming`).
- React hooks: respect `react-hooks/exhaustive-deps` — list every reactive value used in a hook in its dependency array.
- **For `data-*` attributes, use the `.dataset` API, never `getAttribute`/`setAttribute`** (per `prefer-dom-node-dataset`). Read with `element.dataset.jahiaPath`, write with `element.dataset.jahiaPath = value` — not `element.getAttribute('data-jahia-path')`. The kebab-case attribute (`data-jahia-path`) maps to the camelCase dataset key (`jahiaPath`). `getAttribute`/`setAttribute` remain correct for non-`data-` attributes (e.g. `jahiatype`, `path`).

## React conventions

- Functional components with hooks only — no class components.
- Place `PropTypes` declarations at the bottom of each component file.
- **Never use `defaultProps`** for new components. Specify default values directly in the destructured parameter list: `function Foo({ bar = 'baz', count = 0 }) { … }`. `defaultProps` is deprecated in React 18 and will be removed in a future major.
- Use `useSelector` / `useDispatch` from `react-redux` for store access. Use `shallowEqual` when selecting objects/arrays.
- File naming: `ComponentName.jsx` for components, `ComponentName.scss` for co-located styles, `ComponentName.gql-queries.js` for GraphQL.
- Use the `~/` import alias for imports under `src/javascript/`.
- For data hooks, follow the patterns in `src/javascript/JContent/EditFrame/Boxes/dataHooks/`.

## SCSS

- Linted by `stylelint` extending `@jahia/stylelint-config`.
- Co-locate `.scss` next to the component using it; import as `import styles from './Component.scss'`.
- Use kebab-case for class names; access via `styles.camelCaseClassName` (CSS-modules-like behavior).

## GraphQL

- Place queries/mutations in `*.gql-queries.js` files using `gql` from `graphql-tag`.
- Refetch logic uses `setRefetcher` / `unsetRefetcher` from `~/JContent/JContent.refetches`.

## Java GraphQL API

- **Every** `@GraphQLField`, `@GraphQLName`-annotated class, and `@GraphQLName`-annotated parameter **must** have a `@GraphQLDescription` annotation with a meaningful, non-empty description.
- This is enforced by a CI schema-description test that walks all types under `Query`, `Mutation`, and `Subscription` and fails if any node is missing a description.
- When creating or modifying a GraphQL type/field/input/parameter in `src/main/java/`, always add `@GraphQLDescription("...")` alongside `@GraphQLField` or `@GraphQLName`.
- Import `graphql.annotations.annotationTypes.GraphQLDescription` (or use the wildcard import `graphql.annotations.annotationTypes.*` if the file already does).

## Cypress tests (tests/)

- Specs live under `tests/cypress/e2e/<area>/*.cy.ts` and are TypeScript.
- Use the `JContent` page object from `tests/cypress/page-object` for navigation.
- Use `@jahia/cypress` helpers (`createSite`, `deleteSite`, `enableModule`, `createUser`, `deleteUser`, `grantRoles`) for setup/teardown in `before` / `after` hooks.
- Always pair `createSite` with `deleteSite` and `createUser` with `deleteUser`.
- Use selectors of the form `[data-registry-key="..."]` or `[data-sel-...]` rather than CSS classes when possible.

## Java / Groovy patches

- Patch scripts live in `src/main/resources/META-INF/patches/groovy/` and use the `<NN>-<name>.started.groovy` naming convention.
- Use `JCRTemplate.getInstance().doExecuteWithSystemSession(...)` for repository operations.
- Make patches idempotent — they may be re-run.
- Use `@Field` (`groovy.transform.Field`) when constants need to be visible inside inner classes / closures.

## When making code changes

- Before producing edits, identify the exact lint/style rules at play and produce code that satisfies them on the first try.
- If you propose a `.filter`, `.map`, or comparison, double-check the equality operator is `===` / `!==`.
- After editing a file, mentally re-read the diff and check for: `==`, `!=`, `var`, missing semicolons, double quotes, tabs.
- Prefer minimal, targeted edits over rewriting entire files.
- Match the surrounding code's style even if these instructions don't explicitly cover the case.

## Commits

- **Never attribute commits to the AI assistant.** Do not add a `Co-Authored-By` trailer for Claude / any LLM (or any "Generated with" line) to commit messages. Author commits as the human developer only.

## Changelog (chachalog)

This repo uses **chachalog** for changelog entries: one fragment file per change under `.chachalog/*.md`, aggregated into the changelog on merge to `main`. Every functional change should ship a fragment in the same branch/PR.

When wrapping up work on a branch (before committing / opening a PR), ensure a fragment exists for the current branch, following this procedure:

1. **Detect** whether the branch already has a fragment. Fragments are random-named, so "belongs to this branch" means "added relative to `main`":
   ```bash
   BASE=$(git merge-base HEAD origin/main)
   git diff --name-only --diff-filter=AMR "$BASE"..HEAD -- '.chachalog/*.md'   # committed on branch
   git status --porcelain -- '.chachalog/*.md'                                  # uncommitted / untracked
   ```
   If either lists a `.md` other than `config.mjs`, a fragment already exists — do nothing. Skip the whole procedure when on `main` (no branch context).
2. **Check for a `no-changelog` opt-out on the open PR.** If there is an open PR for the current branch carrying the `no-changelog` label, the author has deliberately opted out — **report that the changelog is skipped because of the `no-changelog` label (mention the PR number) and stop** (do not ask, do not create). Requires `gh` to be authenticated:
   ```bash
   gh pr list --head "$(git branch --show-current)" --state open --json number,labels \
     --jq '.[0] | select(.labels[].name == "no-changelog") | .number'
   ```
   A printed PR number means the label is present → skip. Empty output means no opt-out → continue.
   - If `gh` is **not** authenticated or no PR exists yet, the opt-out cannot be confirmed — do **not** skip on that basis; continue to step 3.
3. **If no fragment and no opt-out, ASK the user** whether to create one. Do not create it silently. If they decline, stop.
4. **If they want one, ASK for the version bump**: `patch`, `minor`, or `major` (the `allowedBumps` in `.chachalog/config.mjs`).
5. **Draft a one-line message** from the branch's commit subjects / the change just made, present it, and **ask the user to accept or edit it**.
6. Create the fragment and stage it. The package key is always `"@jahia/jcontent"`; the filename only needs to be unique (e.g. `.chachalog/$(openssl rand -hex 4).md`):
   ```markdown
   ---
   "@jahia/jcontent": <bump>
   ---

   <accepted message> (#<PR number, if known>)
   ```

## Commands cheat-sheet

- `yarn lint` — full lint (SCSS + JS).
- `yarn lint:fix` — auto-fix where possible.
- `yarn test` — Jest unit tests.
- `yarn build` — webpack build.
- `cd tests && yarn cypress:run` — Cypress E2E (see `tests/cypress.config-*.ts` for suite-specific configs).

