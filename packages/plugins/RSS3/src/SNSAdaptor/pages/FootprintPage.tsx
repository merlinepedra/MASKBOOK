import { CollectionDetailCard } from '@masknet/shared'
import type { RSS3BaseAPI } from '@masknet/web3-providers'
import type { NetworkPluginID, SocialAddress } from '@masknet/web3-shared-base'
import { Box } from '@mui/material'
import { useState } from 'react'
import { FootprintCard, StatusBox } from '../components'
import { useRSS3Profile } from '../hooks'
import { useI18N } from '../../locales'

export interface FootprintPageProps {
    footprints?: RSS3BaseAPI.Footprint[]
    loading?: boolean
    address: SocialAddress<NetworkPluginID>
}

export function FootprintPage({ footprints = [], address, loading }: FootprintPageProps) {
    const { value: profile } = useRSS3Profile(address.address || '')
    const username = profile?.name

    const t = useI18N()

    const [selectedFootprint, setSelectedFootprint] = useState<RSS3BaseAPI.Footprint | undefined>()

    if (loading || !footprints.length) {
        return <StatusBox loading={loading} collection={t.footprint()} empty={!footprints.length} />
    }

    return (
        <Box margin="16px 0 0 16px">
            <section className="grid items-center justify-start grid-cols-1 gap-2 py-4 ">
                {footprints.map((footprint) => (
                    <FootprintCard
                        key={footprint.id}
                        onSelect={() => setSelectedFootprint(footprint)}
                        username={username ?? ''}
                        footprint={footprint}
                    />
                ))}
            </section>
            <CollectionDetailCard
                open={Boolean(selectedFootprint)}
                onClose={() => setSelectedFootprint(undefined)}
                img={selectedFootprint?.detail?.image_url}
                title={selectedFootprint?.detail?.name}
                referenceURL={selectedFootprint?.detail?.event_url}
                description={selectedFootprint?.detail?.description}
                date={selectedFootprint?.detail?.end_date}
                location={selectedFootprint?.detail?.city || selectedFootprint?.detail?.country || 'Metaverse'}
            />
        </Box>
    )
}
