import {
    Address,
    beginCell,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    Sender,
    SendMode,
    toNano,
    TupleItem,
    Dictionary,
} from '@ton/core';

export type NFTCollectionConfig = {
    ownerAddress: Address;
    nextItemIndex: number;
    content: Cell;
    nftItemCode: Cell;
    royaltyParams: Cell;
    adminAddress: Address;
};

export function nftCollectionConfigToCell(config: NFTCollectionConfig): Cell {
    return beginCell()
        .storeAddress(config.ownerAddress)
        .storeUint(config.nextItemIndex, 64)
        .storeRef(config.content)
        .storeRef(config.nftItemCode)
        .storeRef(config.royaltyParams)
        .storeDict(Dictionary.empty(Dictionary.Keys.Address(), Dictionary.Values.Bool())) // users dict
        .storeAddress(config.adminAddress)
        .storeRef(beginCell().storeBit(0).storeBit(0).endCell()) // Empty whitelist and blacklist
        .endCell();
}

export class NFTCollection implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new NFTCollection(address);
    }

    static createFromConfig(config: NFTCollectionConfig, code: Cell, workchain = 0) {
        const data = nftCollectionConfigToCell(config);
        const init = { code, data };
        return new NFTCollection(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendMint(provider: ContractProvider, via: Sender, value: bigint, data:         {
        itemIndex: number,
        itemContent: Cell
    }) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(1, 32).storeUint(0, 64).storeUint(data.itemIndex, 64).storeRef(data.itemContent).endCell(),
        });
    }

    async sendAddToWhitelist(provider: ContractProvider, via: Sender, value: bigint, address: Address) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(5, 32).storeUint(0, 64).storeAddress(address).endCell(),
        });
    }

    async sendAddToBlacklist(provider: ContractProvider, via: Sender, value: bigint, address: Address) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(6, 32).storeUint(0, 64).storeAddress(address).endCell(),
        });
    }

    async sendRemoveFromWhitelist(provider: ContractProvider, via: Sender, value: bigint, address: Address) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(7, 32).storeUint(0, 64).storeAddress(address).endCell(),
        });
    }

    async sendRemoveFromBlacklist(provider: ContractProvider, via: Sender, value: bigint, address: Address) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(8, 32).storeUint(0, 64).storeAddress(address).endCell(),
        });
    }

    async getCollectionData(provider: ContractProvider) {
        const result = await provider.get('get_collection_data', []);
        return {
            nextItemIndex: result.stack.readNumber(),
            content: result.stack.readCell(),
            owner: result.stack.readAddress(),
        };
    }

    async getIsWhitelisted(provider: ContractProvider, address: Address) {
        const result = await provider.get('is_whitelisted', [{ type: 'slice', cell: beginCell().storeAddress(address).endCell() } as TupleItem]);
        return result.stack.readBoolean();
    }

    async getIsBlacklisted(provider: ContractProvider, address: Address) {
        const result = await provider.get('is_blacklisted', [{ type: 'slice', cell: beginCell().storeAddress(address).endCell() } as TupleItem]);
        return result.stack.readBoolean();
    }
}