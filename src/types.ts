export type AsyncStatus<TResult> = {
  result: TResult | undefined
  loading: boolean
  errored: boolean
  error: any | undefined
  cancelled: boolean
}

export type AsyncHandle<TResult> = AsyncStatus<TResult> & {
  reload: AsyncReload<TResult>
  resolve: AsyncResolve<TResult>
  cancel: AsyncCancel
}

export type AsyncAction<TResult> = () => Promise<TResult> | TResult
export type AsyncReload<TResult> = (
  action?: AsyncAction<TResult>
) => Promise<TResult | undefined> | TResult | undefined
export type AsyncResolve<TResult> = (result: TResult) => void
export type AsyncCancel = () => void
export type UseAsync = <TResult>(
  action?: AsyncAction<TResult>,
  dependencies?: any[]
) => AsyncHandle<TResult>
