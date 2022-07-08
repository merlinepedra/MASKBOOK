import type { RabbyAPI } from '../types'
import type { ChainId } from '@masknet/web3-shared-evm'

export class ApprovedTokenAPI implements RabbyAPI.Provider<ChainId> {
    async getNonFungibleTokensFromTokenList(chainId: ChainId, account: string) {
        return [] as RabbyAPI.NFTInfo[]
    }
}
