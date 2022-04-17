import type { IDBPDatabase } from "idb/with-async-ittr"
/**
 * We may delegate our database actions to the native on mobile,
 * but we still need to pass the transaction object around to keep high performance on Web platform.
 *
 * This is a wrapper for the transaction, it does not have methods on it so code cannot use it to modify the database directly.
 *
 * If we don't have this wrapper, it allows code to manipulate the database directly, and forgot that we need to delegate it to the native on mobile.
 */
/** @internal */
export type TransparentTransaction<DBSymbol extends symbol, in Store extends string, out isWritable extends boolean = boolean> = {
    readonly __brand?: DBSymbol
    __store__?(store: Store): never
    __writable__?(input: never): isWritable
}
export function createTransparentTransaction<DBSymbol extends symbol, Stores extends string>(getDB: () => Promise<IDBPDatabase<any>>, dbSymbol: DBSymbol, stores: Stores[]) {
    return {
        /** @internal */
        async withReadonlyTransaction<T, OpenStores extends Stores>(stores: OpenStores[], callback: (transaction: () => TransparentTransaction<DBSymbol, OpenStores>) => Promise<T>, ): Promise<T> {
            throw new Error()
        },
        /** @internal */
        async withReadwriteTransaction<T, OpenStores extends Stores>(stores: OpenStores[], callback: (transaction: () => TransparentTransaction<DBSymbol, OpenStores, true>) => Promise<T>,): Promise<T> {
            throw new Error()
        },
        /** @internal */
        __tx__<Store extends Stores, isWritable extends boolean = boolean>(): TransparentTransaction<DBSymbol, Store, isWritable> {
            throw new TypeError()
        }
    }
}
// const aSymbol = Symbol()
// const {__tx__, ...rest} = createTransparentTransaction({} as any, aSymbol, ['a', 'b'])
// export const { withReadonlyTransaction, withReadwriteTransaction } = rest
// async function dbOp(t: typeof __tx__<'a', true>) { }
// withReadonlyTransaction(['a', 'b'], async tx => {
//     dbOp(tx)
// }, )
