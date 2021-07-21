import {Web3ProviderConnector} from './web3-provider.connector';
import Web3 from 'web3';
import {deepEqual, instance, mock, verify, when} from 'ts-mockito';
import {Web3EthereumProvider} from 'web3-providers';
import {Eth} from 'web3-eth';
import {buildPermitTypedData} from '../eip-2612-permit.helper';
import {EIP_2612_PERMIT_ABI} from '../eip-2612-permit.const';

describe('Web3ProviderConnector', () => {
    let web3Provider: Web3;
    let web3ProviderConnector: Web3ProviderConnector;

    const tokenAddress = '0x111111111117dc0aa78b770fa6a738034120c302';
    const tokenName = '1INCH Token';
    const typedData = buildPermitTypedData(
        1,
        tokenAddress,
        tokenName,
        {} as any
    );

    beforeEach(() => {
        web3Provider = mock<Web3>();
        web3ProviderConnector = new Web3ProviderConnector(
            instance(web3Provider)
        );
    });

    it('signTypedData() must call eth_signTypedData_v4 rpc method', async () => {
        const walletAddress = '0xasd';

        const currentProvider = mock<Web3EthereumProvider>();

        when(web3Provider.currentProvider).thenReturn(
            instance(currentProvider)
        );

        await web3ProviderConnector.signTypedData(walletAddress, typedData, '');

        const params = [walletAddress, JSON.stringify(typedData)];

        verify(
            currentProvider.send('eth_signTypedData_v4', deepEqual(params))
        ).once();
    });

    it('signTypedData() must throw error when there is no currentProvider', async () => {
        const walletAddress = '0xasd';

        when(web3Provider.currentProvider).thenReturn();

        let error = null;

        try {
            await web3ProviderConnector.signTypedData(
                walletAddress,
                typedData,
                ''
            );
        } catch (e) {
            error = e;
        }

        expect(error?.message).toBe('Web3 currentProvider is null');
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

        web3ProviderConnector.contractEncodeABI(
            EIP_2612_PERMIT_ABI,
            null,
            'foo',
            []
        );

        verify(eth.Contract).once();
    });
});
