import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'func',
    targets: ['contracts/nft-factory.fc', 'contracts/stdlib.fc', 'contracts/params.fc'],
};
