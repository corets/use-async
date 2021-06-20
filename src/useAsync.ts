import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AsyncAction, AsyncCancel, AsyncRefresh, AsyncReload, AsyncStatus, UseAsync } from "./types"

const createAsyncStatus = <TResult = any>(status: Partial<AsyncStatus<TResult>> = {}): AsyncStatus<TResult> => {
  return {
    loading: false,
    cancelled: false,
    errored: false,
    result: undefined,
    error: undefined,
    ...status,
  }
}

export const useAsync: UseAsync = <TResult>(initializer?: AsyncAction<TResult> | TResult, dependencies = [] as any) => {
  const action = typeof initializer === "function" ? (initializer as AsyncAction<TResult>) : undefined
  const result = typeof initializer !== "function" ? initializer : undefined
  const [status, setStatus] = useState(createAsyncStatus({ loading: !!action, result }))
  const invocationRef = useRef(0)

  const refresh: AsyncRefresh<TResult> = useCallback(
    async (newAction: AsyncAction<TResult> | undefined = action) => {
      if (!newAction) {
        return status.result
      }

      setStatus((status) => createAsyncStatus({ ...status, cancelled: false }))

      const invocation = invocationRef.current + 1
      invocationRef.current = invocation

      try {
        const result = await newAction()

        if (invocation === invocationRef.current) {
          setStatus((status) => {
            if (status.cancelled) {
              return status
            }

            return createAsyncStatus({
              result: result,
            })
          })
        }

        return result
      } catch (error) {
        if (invocation === invocationRef.current) {
          setStatus(
            createAsyncStatus({
              errored: true,
              error: error,
            })
          )
        }
      }
    },
    [action, ...dependencies]
  )

  const reload: AsyncReload<TResult> = useCallback(
    async (newAction: AsyncAction<TResult> | undefined = action) => {
      if (!newAction) {
        return status.result
      }

      setStatus(createAsyncStatus({ loading: true }))

      return refresh(newAction)
    },
    [action, refresh, ...dependencies]
  )

  const cancel: AsyncCancel = useCallback(() => {
    setStatus((status) => {
      if (!status.loading || status.cancelled) {
        return status
      }

      return createAsyncStatus({
        cancelled: true,
      })
    })
  }, [])

  const resolve = useCallback((result: TResult) => {
    invocationRef.current += 1

    setStatus(
      createAsyncStatus({
        result: result,
      })
    )
  }, [])

  useEffect(() => {
    reload(action)
  }, dependencies)

  return {
    ...status,
    reload,
    refresh,
    resolve,
    cancel,
  }
}
