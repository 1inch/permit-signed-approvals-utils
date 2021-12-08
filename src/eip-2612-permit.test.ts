import {Eip2612PermitUtils} from './eip-2612-permit.utils';
import {PrivateKeyProviderConnector} from './connector/private-key-provider.connector';
import Web3 from 'web3';
import {DaiPermitParams, PermitParams} from './model/permit.model';

describe('Eip2612PermitUtils', () => {
    let eip2612PermitUtils: Eip2612PermitUtils;

    const chainId = 56;
    const contractAddress = '0x11111112542d85b3ef69ae05771c2dccff4faa26';
    const tokenAddress = '0x111111111117dc0aa78b770fa6a738034120c302';
    const daiLikeTokenAddress = '0x4bd17003473389a42daf6a0a729f6fdb328bbbd7';
    const tokenName = '1INCH Token';
    const daiLikeTokenName = 'VAI Stablecoin';
    const walletAddress = '0x2c9b2dbdba8a9c969ac24153f5c1c23cb0e63914';
    const privateKey =
        '965e092fdfc08940d2bd05c7b5c7e1c51e283e92c7f52bbf1408973ae9a9acb7';

    const permitParams: PermitParams = {
        owner: walletAddress,
        spender: contractAddress,
        value: '1000000000',
        nonce: 0,
        deadline: 192689033,
    };
    const daiPermitParams: DaiPermitParams = {
        holder: walletAddress,
        spender: contractAddress,
        allowed: true,
        nonce: 0,
        expiry: 192689033,
    };
    const web3 = new Web3('https://bsc-dataseed.binance.org');

    const connector = new PrivateKeyProviderConnector(privateKey, web3);

    beforeEach(() => {
        eip2612PermitUtils = new Eip2612PermitUtils(connector);
    });

    it('Build permit signature', async () => {
        const signature = await eip2612PermitUtils.buildPermitSignature(
            permitParams,
            chainId,
            tokenName,
            tokenAddress
        );

        expect(signature).toBe(
            '0x' +
                '3b448216a78f91e84db06cf54eb1e3758425bd97ffb9d6941ce437ec7a9c2c17' +
                '4c94f1fa492007dea3a3c305353bf3430b1ca506dd630ce1fd3da09bd387b2f3' +
                '1c'
        );
    });

    it('Build permit call data', async () => {
        const callData = await eip2612PermitUtils.buildPermitCallData(
            {
                ...permitParams,
                nonce: await eip2612PermitUtils.getTokenNonce(
                    tokenAddress,
                    walletAddress
                ),
            },
            chainId,
            tokenName,
            tokenAddress
        );

        expect(callData).toBe(
            '0x' +
                '0000000000000000000000002c9b2dbdba8a9c969ac24153f5c1c23cb0e63914' +
                '00000000000000000000000011111112542d85b3ef69ae05771c2dccff4faa26' +
                '000000000000000000000000000000000000000000000000000000003b9aca00' +
                '000000000000000000000000000000000000000000000000000000000b7c3389' +
                '000000000000000000000000000000000000000000000000000000000000001c' +
                '3b448216a78f91e84db06cf54eb1e3758425bd97ffb9d6941ce437ec7a9c2c17' +
                '4c94f1fa492007dea3a3c305353bf3430b1ca506dd630ce1fd3da09bd387b2f3'
        );
    });

    it('Recover owner address from permit call data', async () => {
        const callData = await eip2612PermitUtils.buildPermitCallData(
            {
                ...permitParams,
                nonce: await eip2612PermitUtils.getTokenNonce(
                    tokenAddress,
                    walletAddress
                ),
            },
            chainId,
            tokenName,
            tokenAddress
        );

        const result = await eip2612PermitUtils.recoverPermitOwnerFromCallData({
            chainId,
            tokenName,
            tokenAddress,
            callData
        });

        expect(result).toBe(walletAddress);
    });

    it('Recover owner address from DAI-like permit call data', async () => {
        const callData = await eip2612PermitUtils.buildDaiLikePermitCallData(
            {
                ...daiPermitParams,
                nonce: await eip2612PermitUtils.getTokenNonce(
                    daiLikeTokenAddress,
                    walletAddress
                ),
            },
            chainId,
            daiLikeTokenName,
            daiLikeTokenAddress
        );

        const result = await eip2612PermitUtils.recoverDaiLikePermitOwnerFromCallData({
            chainId,
            tokenName: daiLikeTokenName,
            tokenAddress: daiLikeTokenAddress,
            callData
        });

        expect(result).toBe(walletAddress);
    });

    it('Build DAI-like token permit signature', async () => {
        const signature = await eip2612PermitUtils.buildDaiLikePermitSignature(
            daiPermitParams,
            chainId,
            tokenName,
            tokenAddress
        );

        expect(signature).toBe(
            '0x' +
            'cdcf508eed2f330082c6a19ba5931ebbab16efd470dee2072440aee35c064b73' +
            '6b31b4eed202958a43e250f0a5321db09185f1525776015ecaa8975ca7cf157d' +
            '1b'
        );
    });

    it('Build DAI-like token permit call data', async () => {
        const callData = await eip2612PermitUtils.buildDaiLikePermitCallData(
            {
                ...daiPermitParams,
                nonce: await eip2612PermitUtils.getTokenNonce(
                    daiLikeTokenAddress,
                    walletAddress
                ),
            },
            chainId,
            daiLikeTokenName,
            daiLikeTokenAddress
        );

        expect(callData).toBe(
            '0x' +
            '0000000000000000000000002c9b2dbdba8a9c969ac24153f5c1c23cb0e63914' +
            '00000000000000000000000011111112542d85b3ef69ae05771c2dccff4faa26' +
            '0000000000000000000000000000000000000000000000000000000000000000' +
            '000000000000000000000000000000000000000000000000000000000b7c3389' +
            '0000000000000000000000000000000000000000000000000000000000000001' +
            '000000000000000000000000000000000000000000000000000000000000001b' +
            '99f49015b499f78912d0ce6a8877292474a4d15fa4a7ebb053746156d38c800b' +
            '0ec53280bccec241b6cba87a5f828aae957fedecab9176a1d215d71e74e0f17b'
        );
    });

    it('getPermitTypeHash() should return token PERMIT_TYPEHASH', async () => {
        const hash = await eip2612PermitUtils.getPermitTypeHash(daiLikeTokenAddress);

        expect(hash).toBe(
            '0xea2aa0a1be11a07ed86d755c93467f4f82362b452371d1ba94d1715123511acb'
        );
    });

    it('Build permit signature for token with domain that does not include version', async () => {
        const tokenAddress = '0x5ea29eee799aa7cc379fde5cf370bc24f2ea7c81';
        const signature = await eip2612PermitUtils.buildPermitSignature(
            permitParams,
            chainId,
            'Keep3r BSC Network',
            tokenAddress
        );
        const domainTypeHash = await eip2612PermitUtils.getDomainTypeHash(
            tokenAddress
        );

        expect(signature).toBe(
            '0x' +
                '46083d5525dec0da5fd05c4e7473f1cf6019a9160400187ffd3495861940f2c5' +
                '64c26893ffd9fe42e4daae6aab541ebb1d5a4229cc732e838e94f14d2693beb2' +
                '1c'
        );
        expect(domainTypeHash).toBe(
            '0x797cfab58fcb15f590eb8e4252d5c228ff88f94f907e119e80c4393a946e8f35'
        );
    });

    it('Build permit signature for token with domain that does not include version', async () => {
        const domainSeparator = await eip2612PermitUtils.getDomainSeparator(
            '0x111111111117dc0aa78b770fa6a738034120c302'
        );

        expect(domainSeparator).toBe(
            '0x236db5742c6d63bc63a98b52141886d21552252e5038fc750bd0c6212b6f683f'
        );
    });

    it('syncRecoverPermitOwnerFromCallData()', async () => {
        const owner = eip2612PermitUtils.syncRecoverPermitOwnerFromCallData({
            chainId: 1,
            tokenName: '1INCH Token',
            tokenAddress: '0x111111111117dc0aa78b770fa6a738034120c302',
            callData: '0x000000000000000000000000fb3c7eb936caa12b5a884d612393969a557d4307' +
                '000000000000000000000000119c71d3bbac22029622cbaec24854d3d32d2828' +
                'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff' +
                '0000000000000000000000000000000000000000000000000000000061b0c78c' +
                '000000000000000000000000000000000000000000000000000000000000001c' +
                '1b54f57a0e7cc87462db81467fae81f39c17c720392b1c13652f95738e33558d' +
                '5b70fe9ca7aaf93bbd758172580f369b706e2ee5a9211dd1ce4d273c291a3b2a',
            version: '1',
            nonce: 3
        });

        expect(owner.toLowerCase()).toBe('0xfb3c7eb936caa12b5a884d612393969a557d4307');
    });
});
