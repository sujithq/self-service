import { jest } from '@jest/globals'

export const graphql = jest.fn()
export const paginate = jest.fn()
export const request = jest.fn()
export const rest = {
  actions: {
    createOrgVariable: jest.fn()
  },
  issues: {
    createComment: jest.fn(),
    update: jest.fn()
  },
  orgs: {
    createInvitation: jest.fn(),
    get: jest.fn()
  },
  repos: {
    createInOrg: jest.fn(),
    get: jest.fn(),
    transfer: jest.fn(),
    update: jest.fn()
  },
  teams: {
    getByName: jest.fn(),
    getMembershipForUserInOrg: jest.fn()
  },
  users: {
    getByUsername: jest.fn()
  }
}
