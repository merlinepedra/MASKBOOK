import type { ReactElement } from 'react'
import { Typography, Grid } from '@mui/material'

import { useI18N } from '../../locales'
import type { RewardData } from '../../types'

export interface RewardDataWidgetWidgetProps extends React.PropsWithChildren<{}> {
    title?: string
    icon?: ReactElement
    rewardData?: RewardData
    tokenSymbol?: string
}

export function RewardDataWidget({ title, icon, rewardData, tokenSymbol }: RewardDataWidgetWidgetProps) {
    const t = useI18N()

    return (
        <Grid container marginTop="24px">
            {title && (
                <Grid item xs={12} container marginBottom="12px" alignItems="center">
                    {icon && icon}
                    <Grid item paddingX={1}>
                        <Typography fontWeight={600}>{title}</Typography>
                    </Grid>
                </Grid>
            )}
            <Grid item xs={6} display="flex" flexDirection="column">
                <Typography>{t.daily_farm_reward()}</Typography>
                <Typography fontWeight={600} marginTop="4px">
                    {rewardData ? (
                        <>
                            {Number.parseFloat(rewardData.dailyReward.toFixed(4))} {tokenSymbol ?? '-'}
                        </>
                    ) : (
                        '-'
                    )}
                </Typography>
            </Grid>
            <Grid item xs={6} display="flex" flexDirection="column">
                <Typography>{t.total_farm_rewards()}</Typography>
                <Typography fontWeight={600} marginTop="4px">
                    {rewardData ? (
                        <>
                            {Number.parseFloat(rewardData.totalReward.toFixed(4))} {tokenSymbol ?? '-'}
                        </>
                    ) : (
                        '-'
                    )}
                </Typography>
            </Grid>
        </Grid>
    )
}
