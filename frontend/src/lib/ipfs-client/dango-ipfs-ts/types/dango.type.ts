import type { 
    ImportCandidate, 
    AddOptions, AddResult, 
    ImportCandidateStream, 
    AddAllOptions, IPFSPath, CatOptions, GetOptions, ListOptions, IPFSEntry, KuboRPCClient} from "kubo-rpc-client"


export interface dangoConfig {
    host?: string
    port?: string
    protocol?: string
    url?: string
}

export interface DangoFileHandler {
    /**
     * Add a file or data to IPFS
     */
    addFile(entry: ImportCandidate, options?: AddOptions): Promise<AddResult>
  
    /**
     * Add multiple files or data to IPFS
     */
    addFiles(source: ImportCandidateStream, options?: AddAllOptions): AsyncIterable<AddResult>
  
    /**
     * Retrieve the content of a file from IPFS using its CID or path
     */
    getFile(ipfsPath: IPFSPath, options?: CatOptions): AsyncIterable<Uint8Array>
  
    /**
     * Fetch a file or directory tree from IPFS
     */
    fetchFileOrDir(ipfsPath: IPFSPath, options?: GetOptions): AsyncIterable<Uint8Array>
  
    /**
     * List the contents of a directory from IPFS
     */
    listDirectory(ipfsPath: IPFSPath, options?: ListOptions): AsyncIterable<IPFSEntry>
  }