/**
 * Passes validation if the input is a valid date.
 *
 * @param {string | string[] | {label: string; required: boolean }} field Input field
 * @returns {Promise<string>} An error message or `'success'`
 */
export default async (field) => {
  // Check if the field is a string and a valid date
  if (typeof field !== 'string' || isNaN(new Date(field).getTime()))
    return `Invalid Format (Must be YYYY-MM-DD): **${field}**`

  return 'success'
}
