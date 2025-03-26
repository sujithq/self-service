/**
 * Passes validation if the repository visibility is valid.
 *
 * @param {string | string[] | {label: string; required: boolean }} field Input field
 * @returns {Promise<string>} An error message or `'success'`
 */
export default async (field) => {
  if (['internal', 'private', 'public'].includes(field.towLowerCase()))
    return 'success'

  return `Invalid Repository Visibility (Must be 'internal', 'private', or 'public'): **${field}**`
}
