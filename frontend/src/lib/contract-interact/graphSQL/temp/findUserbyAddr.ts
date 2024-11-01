import { gql, request } from "graphql-request"
export const findUserbyAddr = (address: string):string => {
    const subAddress = address.toLowerCase()
    const graphSQL = gql`{
      user(id: "${subAddress}") {
        isLocked
        id
        lastUpdated
      }
    }`
    return graphSQL
}