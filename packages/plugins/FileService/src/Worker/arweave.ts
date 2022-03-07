import { Attachment } from '@dimensiondev/common-protocols'
import { encodeText } from '@dimensiondev/kit'
import Arweave from 'arweave/web'
import type Transaction from 'arweave/web/lib/transaction'
import type { JWKInterface } from 'arweave/web/lib/wallet'
import { isEmpty } from 'lodash-unified'
import { landing, mesonPrefix } from '../constants'
import { sign } from './remote-signing'
import TOKEN from './arweave-token.json'
import type { ProviderAgent, LandingPageMetadata, AttachmentOptions } from '../types'
import { makeFileKeySigned } from '../helpers'

class ArweaveAgent implements ProviderAgent {
    instance!: Arweave
    static stage: Record<Transaction['id'], Transaction> = {}

    init() {
        if (this.instance) return
        this.instance = Arweave.init({
            host: 'arweave.net',
            port: 443,
            protocol: 'https',
        })
    }

    async makeAttachment(options: AttachmentOptions) {
        this.init()
        const passphrase = options.key ? encodeText(options.key) : undefined
        const encoded = await Attachment.encode(passphrase, {
            block: options.block,
            mime: isEmpty(options.type) ? 'application/octet-stream' : options.type,
            metadata: null,
        })
        const transaction = await this.makePayload(encoded, 'application/octet-stream')
        ArweaveAgent.stage[transaction.id] = transaction
        await this.instance.transactions.post(transaction)
        return transaction.id
    }

    async uploadLandingPage(metadata: LandingPageMetadata) {
        this.init()
        let linkPrefix = 'https://arweave.net'
        if (metadata.useCDN) {
            linkPrefix = mesonPrefix
        }
        const encodedMetadata = JSON.stringify({
            name: metadata.name,
            size: metadata.size,
            provider: 'arweave',
            link: `${linkPrefix}/${metadata.txId}`,
            signed: await makeFileKeySigned(metadata.key),
            createdAt: new Date().toISOString(),
        })
        const response = await fetch(landing)
        const text = await response.text()
        const replaced = text.replace('__METADATA__', encodedMetadata)
        const data = encodeText(replaced)
        const transaction = await this.makePayload(data, 'text/html')
        await this.instance.transactions.post(transaction)
        return transaction.id
    }

    async *upload(id: Transaction['id']) {
        this.init()
        for await (const uploader of this.instance.transactions.upload(ArweaveAgent.stage[id])) {
            yield uploader.pctComplete
        }
    }

    async makePayload(data: Uint8Array, type: string) {
        this.init()
        const transaction = await this.instance.createTransaction({ data }, TOKEN as JWKInterface)
        transaction.addTag('Content-Type', type)
        await sign(transaction)
        return transaction
    }
}

export default new ArweaveAgent()
