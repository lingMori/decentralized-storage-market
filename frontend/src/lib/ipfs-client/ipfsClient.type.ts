export interface IpfsConfig {
    protocol: string,
    host: string, 
    port: string
}

export interface IpfsKeyConfig {
    arg: string,
    type?: "rsa" | "ed25519",
    size?: number,
    ipnsBase?: string
}

export interface IpfsKeyCreateResponse {
    Id: string,
    Name: string
}

export interface IpfsNamePublishResponse {
    Name: string,
    Value: string
}

export interface IpfsResponseDataObject{
    Name:string,
    Hash:string,
    Size:string
}

export type IpfsResponseData = IpfsResponseDataObject | IpfsResponseDataObject[];
export type keyType = IpfsKeyCreateResponse;
export type nameType = IpfsNamePublishResponse;

export type IpfsUploadResult = IpfsResponseData;
export type IpfsCreateKeyResult = IpfsKeyCreateResponse;
export type IpfsPublishNameResult = IpfsNamePublishResponse
