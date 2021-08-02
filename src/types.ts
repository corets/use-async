import { AsyncProducerWithoutArgs, ObservableAsync } from "@corets/async"

export type UseAsync = <TResult>(
  producer: ObservableAsync<TResult> | AsyncProducerWithoutArgs<TResult>,
  dependencies?: any[]
) => ObservableAsync<TResult>
