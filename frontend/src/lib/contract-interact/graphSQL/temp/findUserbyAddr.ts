import { gql } from "graphql-request"
export const findUserbyAddr = (address: string):string => {
    const subAddress = address.toLowerCase()
    const graphSQL = gql`{
      user(id: "${subAddress}") {
        id
        freeLoad
        maxLoad
        totalFiles
        lastUpdated
        isLocked
      }
    }`
    return graphSQL
}
