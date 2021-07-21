import Web3 from 'web3';
import {instance, mock, verify, when} from 'ts-mockito';
import {Eth} from 'web3-eth';
import {PrivateKeyProviderConnector} from './private-key-provider.connector';
import {buildPermitTypedData} from '../eip-2612-permit.helper';
import {EIP_2612_PERMIT_ABI} from '../eip-2612-permit.const';
import {PermitParams} from '../model/permit.model';

describe('PrivateKeyProviderConnector', () => {
    let web3Provider: Web3;
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
    const typedData = buildPermitTypedData(
        1,
        tokenAddress,
        tokenName,
        permitParams
    );

    beforeEach(() => {
        web3Provider = mock<Web3>();
        privateKeyProviderConnector = new PrivateKeyProviderConnector(
            testPrivateKey,
            instance(web3Provider)
        );
    });

    it('signTypedData() must sign typed data by private key', async () => {
        const walletAddress = '0xa07c1d51497fb6e66aa2329cecb86fca0a957fdb';
        const expectedSignature =
            '0x' +
            'c4c689bfcdf6f8a1f697750be56026a6f4b990be31a7c868a58d7bd7c363d92b' +
            '6ab34501e3cdc2d4aa5ff90ed89805d9ee13b1212f73f4626002d389a8a3ab64' +
            '1b';

        const signature = await privateKeyProviderConnector.signTypedData(
            walletAddress,
            typedData
        );

        expect(signature).toBe(expectedSignature);
    });

    it('contractEncodeABI() changed address from null to undefined for contract instance', async () => {
        const eth = mock<Eth>();
        class ContractMock {
            methods = {
                foo: () => ({encodeABI: () => ''}),
            };
        }

        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        when(eth.Contract).thenReturn(ContractMock as any);
        when(web3Provider.eth).thenReturn(instance(eth));

        privateKeyProviderConnector.contractEncodeABI(
            EIP_2612_PERMIT_ABI,
            null,
            'foo',
            []
        );

        verify(eth.Contract).once();
    });
});
