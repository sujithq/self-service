# Contributing

All contributions are welcome and greatly appreciated!

## Initial Setup

> [!WARNING]
>
> Check the `engine` property in [`package.json`](./package.json) to see what
> version of Node.js is required for local development. This can be different
> from the version of Node.js used on the GitHub Actions runners. Tools like
> [nodenv](https://github.com/nodenv/nodenv) can be used to manage your Node.js
> version automatically.

1. Fork this repository
1. Commit your changes
1. Test your changes
1. Make sure to run `npm run all` before committing your final changes!
1. Open a pull request back to this repository
1. Notify the maintainers of this repository for peer review and approval
1. Merge :tada:

The maintainers of this repository will create a new release with your changes
so that everyone can use the new release and enjoy the awesome features of
branch deployments!

## Testing

This project requires **100%** test coverage.

> [!IMPORTANT]
>
> It is critical that we have 100% test coverage to ensure that we are not
> introducing any regressions. All changes will be throughly tested by
> maintainers of this repository before a new release is created.

### Running the Test Suite

Simply run the following command to execute the entire test suite:

```bash
npm run test
```

> [!NOTE]
>
> This requires that you have already run `npm install`

## Adding New IssueOps

Adding a new IssueOps workflow is a simple process. Each step has been broken
down in the following sections.

> [!NOTE]
>
> If you are creating a new IssueOps workflow, consider creating a PR back to
> this repository to share it with the community!

### Create an Issue Forms Template

Each IssueOps workflow requires a corresponding
[issue forms template](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms).
When creating a new issue form, make sure to set the following:

| Setting       | Value                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------ |
| `name`        | Provide a descriptive name for the issue form.                                             |
| `description` | A brief description of the issue form.                                                     |
| `title`       | The title of the issue.                                                                    |
| `labels`      | Make sure to include the `issue-ops` label, as well as a unique label for this issue form. |

In the `body` section of the issue form, each input field should include the
following:

| Setting       | Value                                              |
| ------------- | -------------------------------------------------- |
| `type`        | The input type.                                    |
| `id`          | A unique ID for the input.                         |
| `attributes`  | Make sure to set the `label` attribute.            |
| `validations` | Set the `required` attribute to `true` or `false`. |

The remaining settings can be customized to fit the input type and use case. For
the complete syntax, see
[Syntax for GitHub's form schema](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-githubs-form-schema).

### Update `issue-ops.json`

The [`issue-ops.json`](./data/issue-ops.json) file contains a list of all of the
IssueOps that are supported by this project. This file is used to generate the
clickable links in the GitHub Pages site. The entries in this file have the
following schema.

```jsonc
{
  // A list of GitHub handles and/or teams that are responsible for approving
  // this request before it can be processed.
  "approvers": [],

  // A list of GitHub handles (not teams) that are assigned to this request
  // when it is created (issues do not support team assignment).
  "assignees": [],

  // The category (enterprise, organization, or repository).
  "category": "organization",

  // A description of the functionality that is implemented.
  "description": "Create an organization announcement banner.",

  // The icon to display in the GitHub Pages site. Icon names can be found at
  // https://lucide.dev/icons/.
  "icon": "Volume2",

  // The name of the issue form template to use.
  "issueFormTemplate": "create-announcement.yml",

  // The title of the issue.
  "issueTitle": "[IssueOps] Create a new announcement",

  // The unique label added to issues created with this template.
  "label": "create-announcement",

  // The name of the IssueOps workflow.
  "name": "Announcement"
}
```

When creating a new entry in this file, make sure to set all of the fields!

### Create or Configure Validators

If any extra validation is required for issue form responses, you can create
additional validator scripts in the [`.github/validators`](./.github/validators)
directory. This repository uses the
[`issue-ops/validator`](https://github.com/issue-ops/validator) GitHub Action to
validate issue forms. This action will automatically validate all issue forms
when an issue is created or updated.

#### Create a New Validator

As a general recommendation, name the validator script something like
`<condition>-<expected result>.js`. For example, if you are validating that the
`username` input only contains alphanumeric characters, you could name the
`.github/validators` directory.

#### Update the Validator Configuration

The [`.github/validator/config.yml`](./.github/validator/config.yml) file maps
validator scripts to input fields in issue forms. Make sure to add your
validator script to this file.

```yml
validators:
  - field: <issue forms field ID>
    script: <validator script name with extension>
```

### Add the Action Code

The [`action/`](./action) directory contains all of the code that is required to
implement each IssueOps workflow. When creating a new one, add your code to the
appropriate directory based on the category (enterprise, organization, or
repository).

> [!IMPORTANT]
>
> If you would like to contrbute back to this repository, please make sure to
> include a check for "demo mode" in your action code. This is used to prevent
> any actual changes from being made in the `issue-ops/self-service` repository.
>
> For example:
>
> ```typescript
> // Archive the repository (when not in demo mode)
> if (!DEMO_MODE() && repo.archived === false)
>   await octokit.rest.repos.update({
>     owner: issue.archive_repository_organization,
>     repo: issue.archive_repository_name,
>     archived: true
>   })
> ```
>
> IF YOU DO NOT INCLUDE THIS CHECK, YOUR PULL REQUEST WILL BE REJECTED.

Once you have added your action code, make sure to update the following files:

`action/<category>/index.ts`

Add an export for your action code. For example:

```typescript
export { archiveRepository } from './archive-repository.js'
```

[`action/main.ts`](./action/main.ts)

Add a check for your action. For example:

```typescript
if (action === 'archive-repository') await archiveRepository(issueOpsInputs)
else if (action === 'change-repository-visibility')
  await changeRepositoryVisibility(issueOpsInputs)
else if (action === 'create-actions-variable')
  await createActionsVariable(issueOpsInputs)
else if (action === 'create-announcement')
  await createAnnouncement(issueOpsInputs)
else if (action === 'create-project') await createProject(issueOpsInputs)
else if (action === 'create-repository-transfer')
  await createRepositoryTransfer(issueOpsInputs)
else if (action === 'create-repository') await createRepository(issueOpsInputs)
else if (action === 'rename-repository') await renameRepository(issueOpsInputs)
else if (action === 'unarchive-repository')
  await unarchiveRepository(issueOpsInputs)
```

### Add Unit Tests

Please make sure to add unit tests to ensure 100% test coverage!

### Update the Version

In [`package.json`](./package.json), update the version of the package. This
project uses [semantic versioning](https://semver.org/). When creating a new
release, make sure to include a brief description of the changes that were made
in the pull request.

### Rebuild the Project

This project uses [rollup.js](https://rollupjs.org/) to bundle the code. Simply
run the following command to rebuild the project:

```bash
npm i && npm run all
```

### Create a Pull Request

Once you have completed all of the steps above, you can create a pull request to
your forked repository (or back to this one if you're feeling generous!). The
maintainers of the repository will review your pull request and provide
feedback.
