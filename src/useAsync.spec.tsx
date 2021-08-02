import { createAsync, createAsyncState } from "@corets/async"
import { act, render, screen } from "@testing-library/react"
import React from "react"
import { useAsync } from "./useAsync"
import { createValue } from "@corets/value"
import { useValue } from "@corets/use-value"
import { createTimeout } from "@corets/promise-helpers"

describe("useAsync", () => {
  it("uses async with a sync producer instance", () => {
    let counter = 0
    const globalAsync = createAsync(() => ++counter)
    const globalValue = createValue("foo")

    let renders = 0

    const Test = () => {
      renders++
      const value = useValue(globalValue)
      const async = useAsync(globalAsync, [value.get()])

      return <h1>{JSON.stringify(async.getState())}</h1>
    }

    render(<Test />)

    const target = screen.getByRole("heading")

    expect(renders).toBe(2)
    expect(target).toHaveTextContent(JSON.stringify(createAsyncState({ result: 1 })))

    act(() => {
      globalAsync.run()
    })

    expect(renders).toBe(3)
    expect(target).toHaveTextContent(JSON.stringify(createAsyncState({ result: 2 })))

    act(() => {
      globalValue.set("bar")
    })

    expect(renders).toBe(5)
    expect(target).toHaveTextContent(JSON.stringify(createAsyncState({ result: 3 })))
  })

  it("uses async with a sync producer", () => {
    const globalValue = createValue("foo")

    let renders = 0

    const Test = () => {
      renders++
      const [value] = useValue(globalValue).use()
      const async = useAsync(() => value, [value])

      return (
        <div>
          <h1>{JSON.stringify(async.getState())}</h1>
        </div>
      )
    }

    render(<Test />)

    const target = screen.getByRole("heading")

    expect(renders).toBe(2)
    expect(target).toHaveTextContent(JSON.stringify(createAsyncState({ result: "foo" })))

    act(() => {
      globalValue.set("bar")
    })

    expect(renders).toBe(4)
    expect(target).toHaveTextContent(JSON.stringify(createAsyncState({ result: "bar" })))
  })

  it("uses async with an async producer instance", async () => {
    let counter = 0
    const globalAsync = createAsync(async () => ++counter)
    const globalValue = createValue("foo")

    let renders = 0

    const Test = () => {
      renders++
      const value = useValue(globalValue)
      const async = useAsync(globalAsync, [value.get()])

      return <h1>{JSON.stringify(async.getState())}</h1>
    }

    render(<Test />)

    const target = screen.getByRole("heading")

    expect(renders).toBe(2)
    expect(target).toHaveTextContent(JSON.stringify(createAsyncState({ isRunning: true })))

    await act(() => createTimeout(1))

    expect(renders).toBe(3)
    expect(target).toHaveTextContent(JSON.stringify(createAsyncState({ result: 1 })))

    act(() => {
      globalAsync.run()
    })

    expect(renders).toBe(4)
    expect(target).toHaveTextContent(JSON.stringify(createAsyncState({ result: 1, isRunning: true })))

    await act(() => createTimeout(1))

    expect(renders).toBe(5)
    expect(target).toHaveTextContent(JSON.stringify(createAsyncState({ result: 2 })))

    act(() => {
      globalValue.set("bar")
    })

    expect(renders).toBe(7)
    expect(target).toHaveTextContent(JSON.stringify(createAsyncState({ result: 2, isRunning: true })))

    await act(() => createTimeout(1))

    expect(renders).toBe(8)
    expect(target).toHaveTextContent(JSON.stringify(createAsyncState({ result: 3 })))
  })

  it("uses async with an async producer", async () => {
    const globalValue = createValue("foo")

    let renders = 0

    const Test = () => {
      renders++
      const [value] = useValue(globalValue).use()
      const async = useAsync(async () => value, [value])

      return (
        <div>
          <h1>{JSON.stringify(async.getState())}</h1>
        </div>
      )
    }

    render(<Test />)

    const target = screen.getByRole("heading")

    expect(renders).toBe(2)
    expect(target).toHaveTextContent(JSON.stringify(createAsyncState({ isRunning: true })))

    await act(() => createTimeout(1))

    expect(renders).toBe(3)
    expect(target).toHaveTextContent(JSON.stringify(createAsyncState({ result: "foo" })))

    act(() => {
      globalValue.set("bar")
    })

    expect(renders).toBe(5)
    expect(target).toHaveTextContent(JSON.stringify(createAsyncState({ result: "foo", isRunning: true })))

    await act(() => createTimeout(1))

    expect(renders).toBe(6)
    expect(target).toHaveTextContent(JSON.stringify(createAsyncState({ result: "bar" })))
  })
})
