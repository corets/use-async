export type AsyncStatus<TResult> = {
  result: TResult | undefined
  isLoading: boolean
  isErrored: boolean
  error: any | undefined
  isCancelled: boolean
}

export type AsyncHandle<TResult> = AsyncStatus<TResult> & {
  reload: AsyncReload<TResult>
  refresh: AsyncReload<TResult>
  resolve: AsyncResolve<TResult>
  cancel: AsyncCancel
}

export type AsyncAction<TResult> = () => Promise<TResult | undefined> | TResult | undefined
export type AsyncReload<TResult> = (
  action?: AsyncAction<TResult | undefined>
) => Promise<TResult | undefined> | TResult | undefined
export type AsyncRefresh<TResult> = AsyncReload<TResult>
export type AsyncResolve<TResult> = (result: TResult) => void
export type AsyncCancel = () => void
export type UseAsync = <TResult>(
  initializer?: AsyncAction<TResult> | TResult,
  dependencies?: any[]
) => AsyncHandle<TResult>
