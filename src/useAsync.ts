import { useCallback, useEffect, useRef } from "react"
import { AsyncCancel, AsyncProducer, AsyncRefresh, AsyncReload, AsyncStatus, UseAsync } from "./types"
import { useValue } from "@corets/use-value"

const createAsyncStatus = <TResult = any>(status: Partial<AsyncStatus<TResult>> = {}): AsyncStatus<TResult> => {
  return {
    isLoading: false,
    isRefreshing: false,
    isCancelled: false,
    isErrored: false,
    result: undefined,
    error: undefined,
    ...status,
  }
}

export const useAsync: UseAsync = <TResult>(
  initializer?: AsyncProducer<TResult> | TResult,
  dependencies = [] as any
) => {
  const action = typeof initializer === "function" ? (initializer as AsyncProducer<TResult>) : undefined
  const result = typeof initializer !== "function" ? initializer : undefined

  const status = useValue(createAsyncStatus({ isLoading: !!action, result }))
  const invocationRef = useRef(0)

  const refresh: AsyncRefresh<TResult> = useCallback(
    async (newAction: AsyncProducer<TResult> | undefined = action) => {
      if (!newAction) {
        return status.get().result
      }

      status.set(createAsyncStatus({ ...status.get(), isRefreshing: true, isCancelled: false }))

      const invocation = invocationRef.current + 1
      invocationRef.current = invocation

      try {
        const result = await newAction()

        if (invocation === invocationRef.current) {
          if (!status.get().isCancelled) {
            status.set(createAsyncStatus({ result }))
          }
        }

        return result
      } catch (error) {
        if (invocation === invocationRef.current) {
          status.set(createAsyncStatus({ isErrored: true, error }))
        }
      }
    },
    [...dependencies]
  )

  const reload: AsyncReload<TResult> = useCallback(
    async (newAction: AsyncProducer<TResult> | undefined = action) => {
      if (!newAction) {
        return status.get().result
      }

      status.set(createAsyncStatus({ isLoading: true }))

      return refresh(newAction)
    },
    [...dependencies]
  )

  const cancel: AsyncCancel = useCallback(() => {
    if (status.get().isLoading && !status.get().isCancelled) {
      status.set(
        createAsyncStatus({
          isCancelled: true,
        })
      )
    }
  }, [])

  const resolve = useCallback((result: TResult) => {
    invocationRef.current += 1

    status.set(
      createAsyncStatus({
        result: result,
      })
    )
  }, [])

  useEffect(() => {
    reload(action)
  }, dependencies)

  return {
    ...status.get(),
    reload,
    refresh,
    resolve,
    cancel,
  }
}
