import urlcat from 'urlcat'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import {
    HubOptions,
    HubIndicator,
    SourceType,
    createLookupTableResolver,
    NonFungibleTokenRarity,
} from '@masknet/web3-shared-base'
import type { NonFungibleTokenAPI } from '../types'
import { GEM_API_URL } from './constants'

const raritySourceResolver = createLookupTableResolver<
    SourceType.Gem | SourceType.RaritySniper | SourceType.TraitSniper,
    string
>(
    {
        [SourceType.Gem]: 'gem',
        [SourceType.RaritySniper]: 'rarity_sniper',
        [SourceType.TraitSniper]: 'trait_sniper',
    },
    '',
)

async function fetchFromGem<T>(pathname: string) {
    const response = await globalThis.r2d2Fetch(urlcat(GEM_API_URL, pathname))
    const data = await response.json()
    return data as T
}

export class GemAPI implements NonFungibleTokenAPI.Provider<ChainId, SchemaType> {
    async getRarity(address: string, tokenId: string, options?: HubOptions<ChainId, HubIndicator> | undefined) {
        return fetchFromGem<NonFungibleTokenRarity>(
            urlcat('/rarity/:address/:tokenId', {
                address: address.toLowerCase(),
                tokenId: tokenId.toLowerCase(),
            }),
        )
    }
}
