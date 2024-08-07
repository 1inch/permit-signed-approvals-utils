import {instance, mock} from 'ts-mockito';
import {PrivateKeyProviderConnector} from './private-key-provider.connector';
import {buildPermitTypedData} from '../eip-2612-permit.helper';
import {PermitParams} from '../model/permit.model';
import {Web3Like} from './web3';

describe('PrivateKeyProviderConnector', () => {
    let web3Provider: Web3Like;
    let privateKeyProviderConnector: PrivateKeyProviderConnector;

    const testPrivateKey =
        'd8d1f95deb28949ea0ecc4e9a0decf89e98422c2d76ab6e5f736792a388c56c7';

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
    const typedData = buildPermitTypedData({
        chainId: 1,
        tokenAddress,
        tokenName,
        params: permitParams
    });

    beforeEach(() => {
        web3Provider = mock<Web3Like>();
        privateKeyProviderConnector = new PrivateKeyProviderConnector(
            testPrivateKey,
            instance(web3Provider)
        );
    });

    it('signTypedData() must sign typed data by private key', async () => {
        const walletAddress = '0xa07c1d51497fb6e66aa2329cecb86fca0a957fdb';
        const expectedSignature =
            '0x' +
            'fe8e594b9843d16febbb10319dfab9f8d3f1ca5bb634a0d33ea056dd62fd5d25' +
            '1b34e311438469286165fbae77d6770bca26d5d231a346a16e954b2226dec613' +
            '1c';

        const signature = await privateKeyProviderConnector.signTypedData(
            walletAddress,
            typedData
        );

        expect(signature).toBe(expectedSignature);
    });
});
