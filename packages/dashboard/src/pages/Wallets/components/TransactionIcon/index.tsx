import { memo, useMemo } from 'react'
import { Icons } from '@masknet/icons'
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import { FilterTransactionType, TransactionType, useRedPacketConstants } from '@masknet/web3-shared-evm'
import { useChainId } from '@masknet/plugin-infra/web3'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { Box } from '@mui/material'
import classNames from 'classnames'

const useStyles = makeStyles()(() => ({
    container: {
        width: 36,
        height: 36,
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: MaskColorVar.warning.alpha(0.15),
    },
    success: {
        background: MaskColorVar.greenMain.alpha(0.15),
    },
    error: {
        background: MaskColorVar.redMain.alpha(0.15),
    },
    icon: {
        fontSize: 20,
    },
}))

export interface TransactionIconProps {
    type?: string
    transactionType?: string
    address: string
    failed: boolean
}

export const TransactionIcon = memo<TransactionIconProps>(({ address, failed, type, transactionType }) => {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const {
        HAPPY_RED_PACKET_ADDRESS_V1,
        HAPPY_RED_PACKET_ADDRESS_V2,
        HAPPY_RED_PACKET_ADDRESS_V3,
        HAPPY_RED_PACKET_ADDRESS_V4,
    } = useRedPacketConstants(chainId)

    const isRedPacket =
        isSameAddress(HAPPY_RED_PACKET_ADDRESS_V1, address) ||
        isSameAddress(HAPPY_RED_PACKET_ADDRESS_V2, address) ||
        isSameAddress(HAPPY_RED_PACKET_ADDRESS_V3, address) ||
        isSameAddress(HAPPY_RED_PACKET_ADDRESS_V4, address)

    return (
        <TransactionIconUI transactionType={transactionType} isRedPacket={isRedPacket} isFailed={failed} type={type} />
    )
})

export interface TransactionIconUIProps {
    isRedPacket: boolean
    isFailed: boolean
    type?: string
    transactionType?: string
}

export const TransactionIconUI = memo<TransactionIconUIProps>(({ isFailed, isRedPacket, type, transactionType }) => {
    const { classes } = useStyles()
    const icon = useMemo(() => {
        if (isFailed) return <Icons.Close color={MaskColorVar.redMain} className={classes.icon} />
        if (isRedPacket) return <Icons.RedPacket className={classes.icon} />

        switch (type) {
            case TransactionType.SEND:
                return <Icons.Upload color={MaskColorVar.warning} className={classes.icon} />
            case TransactionType.TRANSFER:
                return <Icons.Upload color={MaskColorVar.warning} className={classes.icon} />
            case TransactionType.RECEIVE:
                return <Icons.Download color={MaskColorVar.greenMain} className={classes.icon} />
            case TransactionType.CREATE_LUCKY_DROP:
                return <Icons.RedPacket className={classes.icon} />
            case TransactionType.CREATE_RED_PACKET:
                return <Icons.RedPacket className={classes.icon} />
            case TransactionType.FILL_POOL:
                return <Icons.ITO className={classes.icon} />
            default:
                return <Icons.Interaction color={MaskColorVar.warning} className={classes.icon} />
        }
    }, [isFailed, isRedPacket, type])

    return (
        <Box
            className={classNames(classes.container, {
                [classes.error]: isFailed,
                [classes.success]: transactionType === FilterTransactionType.RECEIVE,
            })}>
            {icon}
        </Box>
    )
})
