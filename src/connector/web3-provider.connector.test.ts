import {Web3ProviderConnector} from './web3-provider.connector';
import { anything, instance, mock, when } from 'ts-mockito';
import {buildPermitTypedData} from '../eip-2612-permit.helper';
import {Web3Like} from './web3';

describe('Web3ProviderConnector', () => {
    let web3Provider: Web3Like;
    let web3ProviderConnector: Web3ProviderConnector;

    const tokenAddress = '0x111111111117dc0aa78b770fa6a738034120c302';
    const tokenName = '1INCH Token';
    const typedData = buildPermitTypedData(
        1,
        tokenAddress,
        tokenName,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {} as any
    );

    beforeEach(() => {
        web3Provider = mock<Web3Like>();
        web3ProviderConnector = new Web3ProviderConnector(
            instance(web3Provider)
        );
    });

    it('signTypedData() must call eth_signTypedData_v4 rpc method', async () => {
        const walletAddress = '0xasd';

        const extendedWeb3 = {
            signTypedDataV4: jest.fn()
        };

        when(web3Provider.extend(anything())).thenReturn(extendedWeb3);

        await web3ProviderConnector.signTypedData(walletAddress, typedData, '');

        expect(extendedWeb3.signTypedDataV4).toHaveBeenCalledWith(walletAddress, JSON.stringify(typedData));
    });

    it('ethCall() should create a contact call', async () => {
        const ethCall = jest.fn();
        const expectedResult = 'test';
        const contractAddress = '0x111111111117dc0aa78b770fa6a738034120c302';
        const callData = '0xee1';

        when(web3Provider.eth).thenReturn({
            call: ethCall
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);


        ethCall.mockReturnValue(Promise.resolve(expectedResult));

        const result = await web3ProviderConnector.ethCall(
            contractAddress,
            callData
        );

        expect(result).toBe(expectedResult);
        expect(ethCall).toHaveBeenCalledTimes(1);
        expect(ethCall).toHaveBeenCalledWith({
            to: contractAddress,
            data: callData,
        });
    });

    it('decodeABIParameter()', () => {
        const result = web3ProviderConnector.decodeABIParameter(
            'uint256',
            '0x0000000000000000000000000000000000000000000000000000000000000110'
        );

        expect(result).toBe(272n)
    });
});
