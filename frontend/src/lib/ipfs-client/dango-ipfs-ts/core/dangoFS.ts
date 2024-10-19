import type { KuboRPCClient } from "kubo-rpc-client";
import type { 
    ImportCandidate, 
    AddOptions, AddResult, 
    ImportCandidateStream, 
    AddAllOptions, IPFSPath, CatOptions, GetOptions, ListOptions, IPFSEntry} from "kubo-rpc-client"
import type { DangoFileHandler } from "../types/dango.type";

class DangoFileService implements DangoFileHandler {
    private client: KuboRPCClient
  
    constructor(client: KuboRPCClient) {
      this.client = client
    }
  
    /**
     * Add a file to IPFS
     */
    async addFile(entry: ImportCandidate, options?: AddOptions): Promise<AddResult> {
      return this.client.add(entry, options)
    }
  
    /**
     * Add multiple files to IPFS
     */
    async *addFiles(source: ImportCandidateStream, options?: AddAllOptions): AsyncIterable<AddResult> {
      return this.client.addAll(source, options)
    }
  
    /**
     * Retrieve file content from IPFS
     */
    async *getFile(ipfsPath: IPFSPath, options?: CatOptions): AsyncIterable<Uint8Array> {
       return this.client.cat(ipfsPath, options)
    }
  
    /**
     * Fetch a file or directory from IPFS
     */
    async *fetchFileOrDir(ipfsPath: IPFSPath, options?: GetOptions): AsyncIterable<Uint8Array> {
      return this.client.get(ipfsPath, options)
    }
  
    /**
     * List directory contents from IPFS
     */
    async *listDirectory(ipfsPath: IPFSPath, options?: ListOptions): AsyncIterable<IPFSEntry> {
      return this.client.ls(ipfsPath, options)
    }
  }

  export default DangoFileService
  