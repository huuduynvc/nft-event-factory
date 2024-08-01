import { beginCell, toNano, Dictionary, Address } from '@ton/core';
import { NFTFactory, NFTFactoryConfig } from '../wrappers/NftFactory';
import { compile, NetworkProvider, sleep } from '@ton/blueprint';
import { NFTCollection } from '../wrappers/NftCollection';

export async function run(provider: NetworkProvider) {
    // // Compile the NFTFactory contract
    // const nftFactoryCode = await compile('NftFactory');

    // // Compile the NFT Collection contract
    // const nftCollectionCode = await compile('NftCollection');

    // // Create the NFTFactory configuration
    // const factoryConfig: NFTFactoryConfig = {
    //     ownerAddress: provider.sender().address!,
    //     nftCollectionCode: nftCollectionCode,
    // };

    // // Create the NFTFactory instance
    // const nftFactory = provider.open(
    //     NFTFactory.createFromConfig(
    //         factoryConfig,
    //         nftFactoryCode
    //     )
    // );

    // // Deploy the NFTFactory contract
    // await nftFactory.sendDeploy(provider.sender(), toNano('0.05'));

    // // Wait for the contract to be deployed
    // await provider.waitForDeploy(nftFactory.address);

    // console.log('NFT Factory deployed at:', nftFactory.address.toString());




    const nftFactory = provider.open(NFTFactory.createFromAddress(Address.parse("kQBbZssjMtKbWxr9XwNikEylxnDO6YayWSGAqRT5SB8REvrm")));

    // Optional: Deploy an NFT Collection as an example
    const nftItemCode = await compile('NftItem');
    const content = beginCell().storeUint(0, 8).endCell();

   // Create HashmapE for users (whitelist and blacklist combined)
    const usersDict = Dictionary.empty(Dictionary.Keys.BigUint(256), Dictionary.Values.Int(2));

    await nftFactory.sendDeployNFTCollection(
        provider.sender(),
        toNano('0.05'),
        {
            nftItemCode: nftItemCode,
            content: content,
            royaltyFactor: 10,
            royaltyBase: 100,
            royaltyDestination: provider.sender().address!,
            whitelist: usersDict,
            blacklist: usersDict
        }
    );

    await sleep(30000);

    console.log('NFT Collection deployment initiated');








    // // Create NFTCollection instance
    // const nftCollection = provider.open(NFTCollection.createFromAddress(Address.parse("kQBT_tBOVIA_7sCJcUhls5n_632YSTupP6Beafv_8p-03YDK")));

    // // Mint an NFT
    // const nftContent = beginCell()
    //     .storeUint(0, 8) // 0 for data, 1 for uri
    //     .storeStringTail("ipfs://QmZzMPwgRcKTnWjJZeUvVQzBtZBYHR5yzs3o1yxrZKkbU1") // IPFS URI example
    //     .endCell();

    // await nftCollection.sendMint(
    //     provider.sender(),
    //     toNano('0.05'),
    //     {
    //         itemIndex: 0,
    //         itemContent: nftContent,
    //     }
    // );

    // console.log('NFT minting initiated');
}