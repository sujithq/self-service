/**
 * Passes validation if the repository name is valid.
 *
 * @param {string | string[] | {label: string; required: boolean }} field Input field
 * @returns {Promise<string>} An error message or `'success'`
 */
export default async (field) => {
  if (field.match(/^[A-Za-z0-9_.-]+$/) === null)
    return `Invalid Repository Name (Only Letters, Digits, '.', '-', and '_'): **${field}**`
  if (field.length < 1 || field.length > 100)
    return `Invalid Repository Name (Length must be between 1 and 100): **${field}**`

  return 'success'
}
