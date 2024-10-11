import type { Helia } from '@helia/http'
import { unixfs, type UnixFS } from '@helia/unixfs'

const createHeliaFile = async (heliaClient: Promise<Helia>):Promise<UnixFS> => {
    const helia = await heliaClient;
    return unixfs(helia);
}

export default createHeliaFile