// create an axios instance to send request (get)
import { request } from "graphql-request"
    
export const createGraphqlClient = (subgraph_api:string, query:string) => {
    const graphsqlClient = request(subgraph_api, query)

    return graphsqlClient
}
    

