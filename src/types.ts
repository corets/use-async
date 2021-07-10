export type AsyncStatus<TResult> = {
  result: TResult | undefined
  isLoading: boolean
  isRefreshing: boolean
  isErrored: boolean
  error: any | undefined
  isCancelled: boolean
}

export type Async<TResult> = AsyncStatus<TResult> & {
  reload: AsyncReload<TResult>
  refresh: AsyncReload<TResult>
  resolve: AsyncResolve<TResult>
  cancel: AsyncCancel
}

export type AsyncProducer<TResult> = () => Promise<TResult | undefined> | TResult | undefined

export type AsyncReload<TResult> = (
  action?: AsyncProducer<TResult | undefined>
) => Promise<TResult | undefined> | TResult | undefined

export type AsyncRefresh<TResult> = AsyncReload<TResult>

export type AsyncResolve<TResult> = (result: TResult) => void

export type AsyncCancel = () => void

export type UseAsync = <TResult>(initializer?: AsyncProducer<TResult> | TResult, dependencies?: any[]) => Async<TResult>
