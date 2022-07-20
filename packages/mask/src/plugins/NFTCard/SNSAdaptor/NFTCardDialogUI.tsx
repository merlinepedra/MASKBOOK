import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { Button } from '@mui/material'
import { PluginWalletStatusBar, useI18N as useBaseI18n } from '../../../utils'
import { PluginId } from '@masknet/plugin-infra'
import { useCurrentWeb3NetworkPluginID } from '@masknet/plugin-infra/web3'
import { WalletMessages } from '../../../plugins/Wallet/messages'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import type { NFTCardDialogTabs } from './NFTCardDialog'
import { useStyles } from './useStyles'
import { chainResolver, NetworkType } from '@masknet/web3-shared-evm'
import { useActivatedPlugin } from '@masknet/plugin-infra/dom'
interface NFTCardDialogUIProps {
    currentTab: NFTCardDialogTabs
}

export function NFTCardDialogUI(props: NFTCardDialogUIProps) {
    const { classes } = useStyles()
    const { t: tb } = useBaseI18n()
    const { setDialog: setSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )
    const pluginId = useCurrentWeb3NetworkPluginID()
    const chainIdList =
        useActivatedPlugin(PluginId.NFTCard, 'any')?.enableRequirement.web3?.[NetworkPluginID.PLUGIN_EVM]
            ?.supportedChainIds ?? []
    return (
        <div>
            222
            <PluginWalletStatusBar className={classes.footer}>
                <Button
                    variant="contained"
                    size="medium"
                    onClick={() => {
                        setSelectProviderDialog({
                            open: true,
                            supportedNetworkList: chainIdList
                                ?.map((chainId) => {
                                    const x = chainResolver.chainNetworkType(chainId)
                                    return x
                                })
                                .filter((x) => Boolean(x)) as NetworkType[],
                        })
                    }}
                    fullWidth>
                    {pluginId === NetworkPluginID.PLUGIN_EVM
                        ? tb('wallet_status_button_change')
                        : tb('wallet_status_button_change_to_evm')}
                </Button>
            </PluginWalletStatusBar>
        </div>
    )
}
