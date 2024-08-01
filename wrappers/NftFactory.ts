import {
    Address,
    beginCell,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    Sender,
    SendMode,
    Dictionary,
} from '@ton/core';

export type NFTFactoryConfig = {
    ownerAddress: Address;
    nftCollectionCode: Cell;
};

export function nftFactoryConfigToCell(config: NFTFactoryConfig): Cell {
    return beginCell()
        .storeAddress(config.ownerAddress)
        .storeRef(config.nftCollectionCode)
        .endCell();
}

export class NFTFactory implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new NFTFactory(address);
    }

    static createFromConfig(config: NFTFactoryConfig, code: Cell, workchain = 0) {
        const data = nftFactoryConfigToCell(config);
        const init = { code, data };
        return new NFTFactory(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendDeployNFTCollection(
        provider: ContractProvider,
        via: Sender,
        value: bigint,
        params: {
            nftItemCode: Cell;
            content: Cell;
            royaltyFactor: number;
            royaltyBase: number;
            royaltyDestination: Address;
            whitelist: any
            blacklist: any
        }
    ) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(1, 32) // op code for deploy NFT collection
                .storeUint(0, 64) // query id
                .storeRef(params.nftItemCode)
                .storeRef(params.content)
                .storeRef(
                    beginCell()
                    .storeUint(params.royaltyFactor, 16)
                    .storeUint(params.royaltyBase, 16)
                    .storeAddress(params.royaltyDestination)
                    .endCell()
                )
                .storeDict(params.whitelist)
                .storeDict(params.blacklist)
                .endCell(),
        });
    }

    async sendChangeOwner(provider: ContractProvider, via: Sender, value: bigint, newOwner: Address) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(2, 32) // op code for change owner
                .storeUint(0, 64) // query id
                .storeAddress(newOwner)
                .endCell(),
        });
    }

    async getOwnerAddress(provider: ContractProvider): Promise<Address> {
        const result = await provider.get('get_owner_address', []);
        return result.stack.readAddress();
    }
}