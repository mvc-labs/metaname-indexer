export interface DbInterface {
    connect(): Promise<void>
    readAllData(handler: (leafData: any)=>void): Promise<void>
    clearData(txid: string): Promise<number>
    saveNode(data: any): Promise<boolean>
    getNode(name: Buffer): Promise<any>
    getNodesByMvc(mvcAddress: string): Promise<any>
    clearDb(): Promise<void>
    close(): Promise<void>
}