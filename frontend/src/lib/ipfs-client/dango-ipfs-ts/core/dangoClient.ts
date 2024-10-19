import { create, type KuboRPCClient } from "kubo-rpc-client";
import type { dangoConfig } from "../types/dango.type";

const createDangoClient = async (dangoConfig: dangoConfig): Promise<KuboRPCClient | null> => {
  try {
    let client:KuboRPCClient | null = null
    if (dangoConfig.url) {
      // throw new Error("Dango config is required");
      client = create({url: dangoConfig.url});
    }else {
      client = create({
        host: dangoConfig.host,
        port: dangoConfig.port,
        protocol: dangoConfig.protocol,
      })
    }
    // Perform a connection test using a basic call like version
    // const version = await client.version();
    // console.log("Connected to Dango server. Version:", version.version);

    return client;
  } catch (error) {
    console.error("Failed to create or connect to Dango client:", error);
    return null; // Return null if there's an error
  }
}

export default createDangoClient