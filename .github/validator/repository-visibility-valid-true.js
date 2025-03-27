/**
 * Passes validation if the repository visibility is valid.
 *
 * @param {string | string[] | {label: string; required: boolean }} field Input field
 * @returns {Promise<string>} An error message or `'success'`
 */
export default async (field) => {
  if (typeof field === 'string')
    if (['internal', 'private', 'public'].includes(field.towLowerCase()))
      return 'success'
    else 'Must be one of the following: internal, private, public'
  else if (Array.isArray(field))
    if (field.length === 0) return 'Missing required field'
    else if (field.length > 1) return 'Must be a single value'
    else if (['internal', 'private', 'public'].includes(field[0].toLowerCase()))
      return 'success'

  return 'Must be one of the following: internal, private, public'
}
