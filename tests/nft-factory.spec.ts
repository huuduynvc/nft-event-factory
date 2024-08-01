// import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
// import { Cell, toNano, beginCell, Dictionary, Address } from '@ton/core';
// import { NFTFactory } from '../wrappers/NftFactory';
// import { NFTCollection, NFTCollectionConfig } from '../wrappers/NftCollection';
// import '@ton/test-utils';
// import { compile } from '@ton/blueprint';

// describe('NFT Factory and Collection', () => {
//     let blockchain: Blockchain;
//     let deployer: SandboxContract<TreasuryContract>;
//     let nftFactory: SandboxContract<NFTFactory>;
//     let nftCollection: SandboxContract<NFTCollection>;
//     let nftFactoryCode: Cell;
//     let nftCollectionCode: Cell;
//     let nftItemCode: Cell;

//     beforeAll(async () => {
//         nftFactoryCode = await compile('NftFactory');
//         nftCollectionCode = await compile('NftCollection');
//         nftItemCode = await compile('NftItem');
//     });

//     beforeEach(async () => {
//         blockchain = await Blockchain.create();
//         deployer = await blockchain.treasury('deployer');

//         nftFactory = blockchain.openContract(
//             NFTFactory.createFromConfig(
//                 {
//                     ownerAddress: deployer.address,
//                     nftCollectionCode: nftCollectionCode,
//                 },
//                 nftFactoryCode
//             )
//         );

//         await nftFactory.sendDeploy(deployer.getSender(), toNano('0.05'));

//         const content = beginCell().storeUint(0, 8).endCell();
//         const royaltyParams = beginCell().storeUint(5, 16).storeUint(100, 16).storeAddress(deployer.address).endCell();

//         const deployCollectionResult = await nftFactory.sendDeployNFTCollection(
//             deployer.getSender(),
//             toNano('0.05'),
//             {
//                 collectionOwner: deployer.address,
//                 nftItemCode: nftItemCode,
//                 content: content,
//                 royaltyFactor: 5,
//                 royaltyBase: 100,
//                 royaltyDestination: deployer.address,
//                 whitelist: Dictionary.empty(Dictionary.Keys.Address(), Dictionary.Values.Bool()),
//                 blacklist: Dictionary.empty(Dictionary.Keys.Address(), Dictionary.Values.Bool()),
//                 adminAddress: deployer.address,
//             }
//         );

//         console.log("nft collection address: ", nftFactory.address);

//         const nftCollectionConfig: NFTCollectionConfig = {
//             ownerAddress: deployer.address,
//             nextItemIndex: 0,
//             content: content,
//             nftItemCode: nftItemCode,
//             royaltyParams: royaltyParams,
//             adminAddress: deployer.address,
//         };

//         nftCollection = blockchain.openContract(
//             NFTCollection.createFromConfig(nftCollectionConfig, nftCollectionCode)
//         );
//     });

//     it('should allow whitelisted user to mint multiple times', async () => {
//         const whitelistedUser = await blockchain.treasury('whitelisted');
        
//         // Add user to whitelist
//         await nftCollection.sendAddToWhitelist(deployer.getSender(), toNano('0.05'), whitelistedUser.address);

//         // Mint first NFT
//         const mintResult1 = await nftCollection.sendMint(whitelistedUser.getSender(), toNano('0.05'));
//         // expect(mintResult1.transactions).toHaveTransaction({
//         //     from: whitelistedUser.address,
//         //     to: nftCollection.address,
//         //     success: true,
//         // });

//         // Mint second NFT
//         const mintResult2 = await nftCollection.sendMint(whitelistedUser.getSender(), toNano('0.05'));
//         // expect(mintResult2.transactions).toHaveTransaction({
//         //     from: whitelistedUser.address,
//         //     to: nftCollection.address,
//         //     success: true,
//         // });

//         const collectionData = await nftCollection.getCollectionData();
//         expect(collectionData.nextItemIndex).toEqual(2);
//     });

//     // it('should prevent blacklisted user from minting', async () => {
//     //     const blacklistedUser = await blockchain.treasury('blacklisted');
        
//     //     // Add user to blacklist
//     //     await nftCollection.sendAddToBlacklist(deployer.getSender(), toNano('0.05'), blacklistedUser.address);

//     //     // Attempt to mint
//     //     const mintResult = await nftCollection.sendMint(blacklistedUser.getSender(), toNano('0.05'));
//     //     expect(mintResult.transactions).toHaveTransaction({
//     //         from: blacklistedUser.address,
//     //         to: nftCollection.address,
//     //         success: false,
//     //         exitCode: 403, // Assuming 403 is the error code for blacklisted users
//     //     });

//     //     const collectionData = await nftCollection.getCollectionData();
//     //     expect(collectionData.nextItemIndex).toEqual(0);
//     // });

//     // it('should allow normal user to mint only once', async () => {
//     //     const normalUser = await blockchain.treasury('normal');

//     //     // First mint should succeed
//     //     const mintResult1 = await nftCollection.sendMint(normalUser.getSender(), toNano('0.05'));
//     //     expect(mintResult1.transactions).toHaveTransaction({
//     //         from: normalUser.address,
//     //         to: nftCollection.address,
//     //         success: true,
//     //     });

//     //     // Second mint should fail
//     //     const mintResult2 = await nftCollection.sendMint(normalUser.getSender(), toNano('0.05'));
//     //     expect(mintResult2.transactions).toHaveTransaction({
//     //         from: normalUser.address,
//     //         to: nftCollection.address,
//     //         success: false,
//     //         exitCode: 404, // Assuming 404 is the error code for normal users trying to mint again
//     //     });

//     //     const collectionData = await nftCollection.getCollectionData();
//     //     expect(collectionData.nextItemIndex).toEqual(1);
//     // });

//     // it('should allow admin to add and remove from whitelist and blacklist', async () => {
//     //     const user = await blockchain.treasury('user');

//     //     // Add to whitelist
//     //     await nftCollection.sendAddToWhitelist(deployer.getSender(), toNano('0.05'), user.address);
//     //     expect(await nftCollection.getIsWhitelisted(user.address)).toBe(true);

//     //     // Remove from whitelist
//     //     await nftCollection.sendRemoveFromWhitelist(deployer.getSender(), toNano('0.05'), user.address);
//     //     expect(await nftCollection.getIsWhitelisted(user.address)).toBe(false);

//     //     // Add to blacklist
//     //     await nftCollection.sendAddToBlacklist(deployer.getSender(), toNano('0.05'), user.address);
//     //     expect(await nftCollection.getIsBlacklisted(user.address)).toBe(true);

//     //     // Remove from blacklist
//     //     await nftCollection.sendRemoveFromBlacklist(deployer.getSender(), toNano('0.05'), user.address);
//     //     expect(await nftCollection.getIsBlacklisted(user.address)).toBe(false);
//     // });
// });