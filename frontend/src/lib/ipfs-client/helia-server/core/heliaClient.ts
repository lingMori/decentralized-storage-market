import { createHeliaHTTP, type Helia } from "@helia/http"
import { trustlessGateway } from "@helia/block-brokers"
import { httpGatewayRouting } from "@helia/routers"
import type { HeliaServerConfig } from "./helia-server.type"

const  createHeliaHTTPClient = (heliaConfig: HeliaServerConfig):Promise<Helia> => {
    return createHeliaHTTP({
        blockBrokers: [
            trustlessGateway()
        ],
        routers: [
            httpGatewayRouting({
                gateways:[`${heliaConfig.protocol}://${heliaConfig.host}${heliaConfig.port?`:${heliaConfig.port}`:''}`]
            })
        ]
    })
}

export default createHeliaHTTPClient