import { useEffect, useMemo, useRef, useState } from "react"
import { Async, AsyncProducerWithoutArgs, ObservableAsync } from "@corets/async"
import { UseAsync } from "./types"

export const useAsync: UseAsync = <TResult>(producer, dependencies = [] as any[]) => {
  const [reference, setReference] = useState(0)
  const producerRef = useRef(producer as AsyncProducerWithoutArgs<TResult>)

  const async = useMemo<ObservableAsync<TResult>>(() => {
    if (producer instanceof Async) {
      return producer
    }

    return new Async(() => producerRef.current())
  }, [])

  useEffect(() => {
    return async.listen(() => setReference((previous) => previous + 1))
  }, [])

  useEffect(() => {
    producerRef.current = producer
  }, [producer])

  useEffect(() => {
    async.run()
  }, dependencies)

  return async
}
