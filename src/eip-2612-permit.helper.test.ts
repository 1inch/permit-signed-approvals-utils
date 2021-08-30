import {
    buildPermitTypedData,
    fromRpcSig,
    getPermitContractCallParams,
} from './eip-2612-permit.helper';
import {PermitParams} from './model/permit.model';

describe('eip-2612 permit helpers', () => {
    const chainId = 56;
    const contractAddress = '0x11111112542d85b3ef69ae05771c2dccff4faa26';
    const tokenAddress = '0x111111111117dc0aa78b770fa6a738034120c302';
    const tokenName = '1INCH Token';
    const walletAddress = '0x2c9b2dbdba8a9c969ac24153f5c1c23cb0e63914';

    const permitParams: PermitParams = {
        owner: walletAddress,
        spender: contractAddress,
        value: '1000000000',
        nonce: 0,
        deadline: 192689033,
    };

    it('buildPermitTypedData()', () => {
        const data = buildPermitTypedData(
            chainId,
            tokenName,
            tokenAddress,
            permitParams
        );

        expect(data).toMatchSnapshot();
    });

    it('fromRpcSig()', () => {
        const signature =
            '0x' +
            '3b448216a78f91e84db06cf54eb1e3758425bd97ffb9d6941ce437ec7a9c2c17' +
            '4c94f1fa492007dea3a3c305353bf3430b1ca506dd630ce1fd3da09bd387b2f3' +
            '1c';
        const data = fromRpcSig(signature);

        expect(data).toMatchSnapshot();
    });

    it('fromRpcSig() should throw error when signature length is invalid', () => {
        const signature =
            '0x' +
            '3b448216a78f91e84db06cf54eb1e3758425bd97ffb9d6941ce437ec7a9c2c17' +
            '4c94f1fa492007dea3a3c305353bf3430b1ca506dd630ce1fd3da09bd387b2f3' +
            '1c11001100';
        const t = () => fromRpcSig(signature);

        expect(t).toThrowError('Invalid signature length');
    });

    it('fromRpcSig() should cut 0x from the signature', () => {
        const signature =
            '3b448216a78f91e84db06cf54eb1e3758425bd97ffb9d6941ce437ec7a9c2c17' +
            '4c94f1fa492007dea3a3c305353bf3430b1ca506dd630ce1fd3da09bd387b2f3' +
            '1c';

        const without0x = fromRpcSig(signature);
        const with0x = fromRpcSig('0x' + signature);

        expect(without0x).toEqual(with0x);
    });

    it('fromRpcSig() should support both versions of `eth_sign` responses', () => {
        const signature =
            '3b448216a78f91e84db06cf54eb1e3758425bd97ffb9d6941ce437ec7a9c2c17' +
            '4c94f1fa492007dea3a3c305353bf3430b1ca506dd630ce1fd3da09bd387b2f3' +
            '1a';

        const result = fromRpcSig(signature);

        expect(result).toMatchSnapshot();
    });

    it('getPermitContractCallParams()', () => {
        const signature =
            '0x' +
            '3b448216a78f91e84db06cf54eb1e3758425bd97ffb9d6941ce437ec7a9c2c17' +
            '4c94f1fa492007dea3a3c305353bf3430b1ca506dd630ce1fd3da09bd387b2f3' +
            '1c';

        const result = getPermitContractCallParams(permitParams, signature);

        expect(result).toMatchSnapshot();
    });
});
