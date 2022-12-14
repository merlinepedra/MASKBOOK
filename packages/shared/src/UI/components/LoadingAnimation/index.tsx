import { GeneratedIconProps, Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import classNames from 'classnames'

const useStyles = makeStyles()({
    animated: {
        '@keyframes loadingAnimation': {
            '0%': {
                transform: 'rotate(0deg)',
            },
            '100%': {
                transform: 'rotate(360deg)',
            },
        },
        animation: 'loadingAnimation 1.6s linear infinite',
    },
})

export const LoadingAnimation = (props: GeneratedIconProps) => {
    const { classes } = useStyles()
    return <Icons.CircleLoading {...props} className={classNames(classes.animated, props.className)} />
}

export const CircleLoadingAnimation = (props: GeneratedIconProps) => {
    const { classes } = useStyles()
    return <Icons.CircleLoading {...props} className={classNames(classes.animated, props.className)} />
}
