[![CircleCI](https://circleci.com/gh/Jahia/jcontent/tree/master.svg?style=svg)](https://circleci.com/gh/Jahia/jcontent/tree/master)
![GitHub tag (latest by version)](https://img.shields.io/github/v/tag/Jahia/jContent?sort=semver)
![License](https://img.shields.io/github/license/jahia/jcontent)

<a href="https://www.jahia.com/">
    <img src="https://www.jahia.com/modules/jahiacom-templates/images/jahia-3x.png" alt="Jahia logo" title="Jahia" align="right" height="60" />
</a>

# jContent test module

Contains cypress page objects and utils for implementing jContent-related tests in cypress.

### Publishing test module

Trigger `Publish tests module to NPM registry` workflow [here](https://github.com/Jahia/jcontent/actions/workflows/release-tests-module.ymlhttps:/). This will:

- Increment current version and use this as the release version
  - If publishing test module first time after release, the `SNAPSHOT` prerelease identifier will be automatically reset back to `tests.0`
- Create a tag, then push version change commit and tag to the branch where workflow is initiated.
- Publish module to [NPM registry](https://www.npmjs.com/package/@jahia/jcontent-cypress)

> [!IMPORTANT]
> Option to trigger a dry-run in the workflow is also available, which does all the above steps except for the actual publishing step. This includes creating a tag and committing the version change, so it's important to run the dry-run worfklow on a separate branch.
