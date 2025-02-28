import { gql } from "graphql-request";

export const findProviders = (): string => {
  const graphSQL = gql`
    {
      storageProviders(where: { isValid: true }) {
        id
        sellID
        providerAddress
        availableSpace
        pricePerMBPerMonth
        stakedETH
        isValid
        createdAt
        updatedAt
      }
    }
  `;
  return graphSQL;
};
