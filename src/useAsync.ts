import { useEffect, useMemo, useRef, useState } from "react"
import { Async, AsyncProducerWithoutArgs, ObservableAsync } from "@corets/async"
import { UseAsync } from "./types"

export const useAsync: UseAsync = <TResult>(
  producer: ObservableAsync<TResult> | AsyncProducerWithoutArgs<TResult>,
  dependencies = [] as any[]
) => {
  const [reference, setReference] = useState(0)
  const producerRef = useRef<ObservableAsync<TResult> | AsyncProducerWithoutArgs<TResult>>(producer)
  producerRef.current = producer

  const async = useMemo<ObservableAsync<TResult>>(() => {
    if (producerRef.current instanceof Async) {
      return producerRef.current
    }

    return new Async(() => (producerRef.current as AsyncProducerWithoutArgs<TResult>)())
  }, [producerRef.current instanceof Async ? producerRef.current : undefined])

  useEffect(() => {
    return async.listen(() => setReference((previous) => previous + 1))
  }, [async])

  useEffect(() => {
    async.run()
  }, [...dependencies, async])

  return async
}
