/**
 * Passes validation if the repository visibility is valid.
 *
 * @param {string | string[] | {label: string; required: boolean }} field Input field
 * @returns {Promise<string>} An error message or `'success'`
 */
export default async (field) => {
  if (['all', 'private', 'selected'].includes(field.towLowerCase()))
    return 'success'

  return `Invalid Variable Visibility (Must be 'all', 'private', or 'selected'): **${field}**`
}
