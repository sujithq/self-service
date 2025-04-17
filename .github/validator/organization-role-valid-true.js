/**
 * Passes validation if the organization role is valid.
 *
 * @param {string | string[] | {label: string; required: boolean }} field Input field
 * @returns {Promise<string>} An error message or `'success'`
 */
export default async (field) => {
  if (!['Member', 'Owner', 'Billing Manager'].includes(field))
    return 'Organization role must be one of: Member, Owner, Billing Manager'

  return 'success'
}
