/**
 * Passes validation if the GitHub Actions variable name is valid.
 *
 * https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/store-information-in-variables#defining-configuration-variables-for-multiple-workflows
 *
 * @param {string | string[] | {label: string; required: boolean }} field Input field
 * @returns {Promise<string>} An error message or `'success'`
 */
export default async (field) => {
  if (field.match(/^[A-Za-z0-9_]+$/) === null)
    return `Invalid Variable Name (Only Letters, Digits, and '-'): **${field}**`
  if (field.startsWith('GITHUB_'))
    return `Invalid Variable Name (Cannot Start with 'GITHUB_'): **${field}**`
  if (field.match(/^[0-9]/) !== null)
    return `Invalid Variable Name (Cannot Start with a Digit): **${field}**`

  return 'success'
}
