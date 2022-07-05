import { ListItem, List, Typography, Link, Avatar } from '@mui/material'
import { useERC20TokenApproveCallback } from '@masknet/plugin-infra/web3-evm'
import { ChainBoundary } from '../../../web3/UI/ChainBoundary'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useState } from 'react'
import type { ChainId, NetworkType } from '@masknet/web3-shared-evm'
import { useAccount, useWeb3State, useNetworkDescriptor } from '@masknet/plugin-infra/web3'
import { LinkOutIcon } from '@masknet/icons'
import { NetworkPluginID, NetworkDescriptor, isGreaterThan } from '@masknet/web3-shared-base'
import { useI18N } from '../locales'
import { useStyles } from './useStyles'
import { useApprovedTokenList } from './hooks/useApprovedTokenList'
import { ApprovalLoadingContent } from './ApprovalLoadingContent'
import { ApprovalEmptyContent } from './ApprovalEmptyContent'
import type { TokenSpender } from './types'

export function ApprovalTokenContent({ chainId }: { chainId: ChainId }) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const { value: spenders, loading } = useApprovedTokenList(account, chainId)
    const networkDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, chainId)
    const { classes } = useStyles({
        listItemBackground: networkDescriptor.backgroundGradient,
        listItemBackgroundIcon: `url("${networkDescriptor.icon}")`,
    })

    return loading ? (
        <ApprovalLoadingContent />
    ) : !spenders || spenders.length === 0 ? (
        <ApprovalEmptyContent />
    ) : (
        <List className={classes.approvalContentWrapper}>
            {spenders.map((spender, i) => (
                <ApprovalTokenItem key={i} spender={spender} networkDescriptor={networkDescriptor} chainId={chainId} />
            ))}
        </List>
    )
}

interface ApprovalTokenItemProps {
    spender: TokenSpender
    networkDescriptor: NetworkDescriptor<ChainId, NetworkType>
    chainId: ChainId
}

function ApprovalTokenItem(props: ApprovalTokenItemProps) {
    const { networkDescriptor, spender, chainId } = props
    const [cancelled, setCancelled] = useState(false)
    const t = useI18N()
    const { classes, cx } = useStyles({
        listItemBackground: networkDescriptor.backgroundGradient,
        listItemBackgroundIcon: `url("${networkDescriptor.icon}")`,
    })
    const { Others } = useWeb3State(NetworkPluginID.PLUGIN_EVM)

    const [_, transactionState, approveCallback] = useERC20TokenApproveCallback(
        spender.tokenInfo.id,
        '0',
        spender.id,
        () => setCancelled(true),
        chainId,
    )

    return cancelled ? null : (
        <div className={classes.listItemWrapper}>
            <ListItem className={classes.listItem}>
                <div className={classes.listItemInfo}>
                    <div>
                        <Avatar src={spender.tokenInfo.logo_url} className={classes.logoIcon} />
                        <Typography className={classes.primaryText}>{spender.tokenInfo.symbol}</Typography>
                        <Typography className={classes.secondaryText}>{spender.tokenInfo.name}</Typography>
                    </div>
                    <div className={classes.contractInfo}>
                        <Typography className={classes.secondaryText}>{t.contract()}</Typography>
                        {!spender.logo ? null : typeof spender.logo === 'string' ? (
                            <img src={spender.logo} className={classes.spenderLogoIcon} />
                        ) : (
                            <div className={classes.spenderMaskLogoIcon}>{spender.logo}</div>
                        )}
                        <Typography className={classes.primaryText}>
                            {spender.name ?? Others?.formatAddress(spender.id, 4)}
                        </Typography>
                        <Link
                            className={classes.link}
                            href={Others?.explorerResolver.addressLink?.(chainId, spender.id) ?? ''}
                            target="_blank"
                            rel="noopener noreferrer">
                            <LinkOutIcon className={cx(classes.spenderLogoIcon, classes.linkOutIcon)} />
                        </Link>
                    </div>
                    <div>
                        <Typography className={classes.secondaryText}>{t.approved_amount()}</Typography>
                        <Typography className={classes.primaryText}>
                            {isGreaterThan(spender.value, '1e+10') ? t.infinite() : spender.value}
                        </Typography>
                    </div>
                </div>
                <ChainBoundary
                    expectedChainId={chainId}
                    expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                    classes={{ switchButton: classes.button }}
                    expectedChainIdSwitchedCallback={() => approveCallback(true, true)}
                    ActionButtonPromiseProps={{
                        fullWidth: false,
                        init: t.revoke(),
                        startIcon: null,
                        failIcon: null,
                        waitingIcon: null,
                        className: classes.button,
                        failedButtonStyle: classes.button,
                        waiting: t.revoking(),
                        complete: t.revoke(),
                        failed: t.revoke(),
                    }}>
                    <ActionButton
                        onClick={() => approveCallback(true, true)}
                        disabled={transactionState.loadingApprove}
                        loading={transactionState.loadingApprove}
                        className={classes.button}>
                        {transactionState.loadingApprove ? t.revoking() : t.revoke()}
                    </ActionButton>
                </ChainBoundary>
            </ListItem>
        </div>
    )
}
