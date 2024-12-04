import { gql } from "graphql-request";

export const findFilesbyAddr = (address: string):string => {
  const subAddress = address.toLowerCase();
  const graphSQL = gql `{
    files(where: {owner: "${subAddress}"}) {
      id
      cid
      owner {
        id
      }
      size
      fileName
      fileType
      isActive
      lastUpdated
      createdAt
    }
  }`;
  return graphSQL;
}
