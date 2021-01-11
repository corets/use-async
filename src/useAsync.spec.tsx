import React from "react"
import { mount } from "enzyme"
import { AsyncHandle, useAsync } from "./index"
import { createPromise, createTimeout } from "@corets/promise-helpers"
import { act } from "react-dom/test-utils"

describe("useAsync", () => {
  it("loads async action", async () => {
    const promise = createPromise()
    let renders = 0
    let receivedHandle: AsyncHandle<any>

    const Test = () => {
      renders++
      receivedHandle = useAsync(() => promise)

      return null
    }

    const wrapper = mount(<Test />)

    expect(renders).toBe(2)
    expect(receivedHandle!.loading).toBe(true)
    expect(receivedHandle!.cancelled).toBe(false)
    expect(receivedHandle!.errored).toBe(false)
    expect(receivedHandle!.result).toBe(undefined)
    expect(receivedHandle!.error).toBe(undefined)

    await act(() => {
      promise.resolve("result")
      return createTimeout(0)
    })

    expect(renders).toBe(3)
    expect(receivedHandle!.loading).toBe(false)
    expect(receivedHandle!.cancelled).toBe(false)
    expect(receivedHandle!.errored).toBe(false)
    expect(receivedHandle!.result).toBe("result")
    expect(receivedHandle!.error).toBe(undefined)
  })

  it("loads only if not cancelled", async () => {
    const promise = createPromise()
    let renders = 0
    let receivedHandle: AsyncHandle<any>

    const Test = () => {
      renders++
      receivedHandle = useAsync(() => promise)

      return null
    }

    const wrapper = mount(<Test />)

    expect(renders).toBe(2)
    expect(receivedHandle!.loading).toBe(true)
    expect(receivedHandle!.cancelled).toBe(false)
    expect(receivedHandle!.errored).toBe(false)
    expect(receivedHandle!.result).toBe(undefined)
    expect(receivedHandle!.error).toBe(undefined)

    await act(() => {
      receivedHandle.cancel()
      promise.resolve("result")
      return createTimeout(0)
    })

    expect(renders).toBe(4)
    expect(receivedHandle!.loading).toBe(false)
    expect(receivedHandle!.cancelled).toBe(true)
    expect(receivedHandle!.errored).toBe(false)
    expect(receivedHandle!.result).toBe(undefined)
    expect(receivedHandle!.error).toBe(undefined)
  })

  it("loads only if not resolved", async () => {
    const promise = createPromise()
    let renders = 0
    let receivedHandle: AsyncHandle<any>

    const Test = () => {
      renders++
      receivedHandle = useAsync(() => promise)

      return null
    }

    const wrapper = mount(<Test />)

    expect(renders).toBe(2)
    expect(receivedHandle!.loading).toBe(true)
    expect(receivedHandle!.cancelled).toBe(false)
    expect(receivedHandle!.errored).toBe(false)
    expect(receivedHandle!.result).toBe(undefined)
    expect(receivedHandle!.error).toBe(undefined)

    await act(() => {
      receivedHandle.resolve("resolved result")
      promise.resolve("result")
      return createTimeout(0)
    })

    expect(renders).toBe(4)
    expect(receivedHandle!.loading).toBe(false)
    expect(receivedHandle!.cancelled).toBe(false)
    expect(receivedHandle!.errored).toBe(false)
    expect(receivedHandle!.result).toBe("resolved result")
    expect(receivedHandle!.error).toBe(undefined)
  })

  it("rejects async action", async () => {
    const promise = createPromise()
    let renders = 0
    let receivedHandle: AsyncHandle<any>

    const Test = () => {
      renders++
      receivedHandle = useAsync(() => promise)

      return null
    }

    const wrapper = mount(<Test />)

    expect(renders).toBe(2)
    expect(receivedHandle!.loading).toBe(true)
    expect(receivedHandle!.cancelled).toBe(false)
    expect(receivedHandle!.errored).toBe(false)
    expect(receivedHandle!.result).toBe(undefined)
    expect(receivedHandle!.error).toBe(undefined)

    await act(() => {
      promise.reject("reason")
      return createTimeout(0)
    })

    expect(renders).toBe(3)
    expect(receivedHandle!.loading).toBe(false)
    expect(receivedHandle!.cancelled).toBe(false)
    expect(receivedHandle!.errored).toBe(true)
    expect(receivedHandle!.result).toBe(undefined)
    expect(receivedHandle!.error).toBe("reason")
  })

  it("cancels async action", async () => {
    const promise = createPromise()
    let renders = 0
    let receivedHandle: AsyncHandle<any>

    const Test = () => {
      renders++
      receivedHandle = useAsync(() => promise)

      return null
    }

    const wrapper = mount(<Test />)

    expect(renders).toBe(2)
    expect(receivedHandle!.loading).toBe(true)
    expect(receivedHandle!.cancelled).toBe(false)
    expect(receivedHandle!.errored).toBe(false)
    expect(receivedHandle!.result).toBe(undefined)
    expect(receivedHandle!.error).toBe(undefined)

    await act(() => {
      receivedHandle.cancel()
      promise.resolve("result")
      return createTimeout(0)
    })

    expect(renders).toBe(4)
    expect(receivedHandle!.loading).toBe(false)
    expect(receivedHandle!.cancelled).toBe(true)
    expect(receivedHandle!.errored).toBe(false)
    expect(receivedHandle!.result).toBe(undefined)
    expect(receivedHandle!.error).toBe(undefined)
  })

  it("cancels only if loading is in progress", async () => {
    const promise = createPromise()
    let renders = 0
    let receivedHandle: AsyncHandle<any>

    const Test = () => {
      renders++
      receivedHandle = useAsync(() => promise)

      return null
    }

    const wrapper = mount(<Test />)

    expect(renders).toBe(2)
    expect(receivedHandle!.loading).toBe(true)
    expect(receivedHandle!.cancelled).toBe(false)
    expect(receivedHandle!.errored).toBe(false)
    expect(receivedHandle!.result).toBe(undefined)
    expect(receivedHandle!.error).toBe(undefined)

    await act(async () => {
      receivedHandle.reload(() => "new result")
      await createTimeout(0)
      receivedHandle.cancel()
    })

    expect(renders).toBe(5)
    expect(receivedHandle!.loading).toBe(false)
    expect(receivedHandle!.cancelled).toBe(false)
    expect(receivedHandle!.errored).toBe(false)
    expect(receivedHandle!.result).toBe("new result")
    expect(receivedHandle!.error).toBe(undefined)
  })

  it("reloads async action", async () => {
    let promise = createPromise()
    let renders = 0
    let receivedHandle: AsyncHandle<any>

    const Test = () => {
      renders++
      receivedHandle = useAsync(() => promise)

      return null
    }

    const wrapper = mount(<Test />)

    expect(renders).toBe(2)
    expect(receivedHandle!.loading).toBe(true)
    expect(receivedHandle!.cancelled).toBe(false)
    expect(receivedHandle!.errored).toBe(false)
    expect(receivedHandle!.result).toBe(undefined)
    expect(receivedHandle!.error).toBe(undefined)

    await act(() => {
      promise.resolve("result")
      return createTimeout(0)
    })

    expect(renders).toBe(3)
    expect(receivedHandle!.loading).toBe(false)
    expect(receivedHandle!.cancelled).toBe(false)
    expect(receivedHandle!.errored).toBe(false)
    expect(receivedHandle!.result).toBe("result")
    expect(receivedHandle!.error).toBe(undefined)

    act(() => {
      promise = createPromise()
      receivedHandle.reload()
    })

    expect(renders).toBe(4)
    expect(receivedHandle!.loading).toBe(true)
    expect(receivedHandle!.cancelled).toBe(false)
    expect(receivedHandle!.errored).toBe(false)
    expect(receivedHandle!.result).toBe(undefined)
    expect(receivedHandle!.error).toBe(undefined)

    await act(() => {
      promise.resolve("new result")
      return createTimeout(0)
    })

    expect(renders).toBe(5)
    expect(receivedHandle!.loading).toBe(false)
    expect(receivedHandle!.cancelled).toBe(false)
    expect(receivedHandle!.errored).toBe(false)
    expect(receivedHandle!.result).toBe("new result")
    expect(receivedHandle!.error).toBe(undefined)
  })

  it("reloads with new action", async () => {
    let promise1 = createPromise()
    let promise2 = createPromise()
    let renders = 0
    let receivedHandle: AsyncHandle<any>

    const Test = () => {
      renders++
      receivedHandle = useAsync(() => promise1)

      return null
    }

    const wrapper = mount(<Test />)

    expect(renders).toBe(2)
    expect(receivedHandle!.loading).toBe(true)
    expect(receivedHandle!.cancelled).toBe(false)
    expect(receivedHandle!.errored).toBe(false)
    expect(receivedHandle!.result).toBe(undefined)
    expect(receivedHandle!.error).toBe(undefined)

    await act(() => {
      promise1.resolve("result")
      return createTimeout(0)
    })

    expect(renders).toBe(3)
    expect(receivedHandle!.loading).toBe(false)
    expect(receivedHandle!.cancelled).toBe(false)
    expect(receivedHandle!.errored).toBe(false)
    expect(receivedHandle!.result).toBe("result")
    expect(receivedHandle!.error).toBe(undefined)

    act(() => {
      receivedHandle.reload(() => promise2)
    })

    expect(renders).toBe(4)
    expect(receivedHandle!.loading).toBe(true)
    expect(receivedHandle!.cancelled).toBe(false)
    expect(receivedHandle!.errored).toBe(false)
    expect(receivedHandle!.result).toBe(undefined)
    expect(receivedHandle!.error).toBe(undefined)

    await act(() => {
      promise2.resolve("new result")
      return createTimeout(0)
    })

    expect(renders).toBe(5)
    expect(receivedHandle!.loading).toBe(false)
    expect(receivedHandle!.cancelled).toBe(false)
    expect(receivedHandle!.errored).toBe(false)
    expect(receivedHandle!.result).toBe("new result")
    expect(receivedHandle!.error).toBe(undefined)
  })

  it("reloads with sync action", async () => {
    let promise = createPromise()
    let renders = 0
    let receivedHandle: AsyncHandle<any>

    const Test = () => {
      renders++
      receivedHandle = useAsync(() => promise)

      return null
    }

    const wrapper = mount(<Test />)

    expect(renders).toBe(2)
    expect(receivedHandle!.loading).toBe(true)
    expect(receivedHandle!.cancelled).toBe(false)
    expect(receivedHandle!.errored).toBe(false)
    expect(receivedHandle!.result).toBe(undefined)
    expect(receivedHandle!.error).toBe(undefined)

    await act(() => {
      promise.resolve("result")
      return createTimeout(0)
    })

    expect(renders).toBe(3)
    expect(receivedHandle!.loading).toBe(false)
    expect(receivedHandle!.cancelled).toBe(false)
    expect(receivedHandle!.errored).toBe(false)
    expect(receivedHandle!.result).toBe("result")
    expect(receivedHandle!.error).toBe(undefined)

    await act(() => {
      receivedHandle.reload(() => "new result")
      return createTimeout(0)
    })

    expect(renders).toBe(5)
    expect(receivedHandle!.loading).toBe(false)
    expect(receivedHandle!.cancelled).toBe(false)
    expect(receivedHandle!.errored).toBe(false)
    expect(receivedHandle!.result).toBe("new result")
    expect(receivedHandle!.error).toBe(undefined)
  })

  it("reloads after cancel", async () => {
    let promise = createPromise()
    let renders = 0
    let receivedHandle: AsyncHandle<any>

    const Test = () => {
      renders++
      receivedHandle = useAsync(() => promise)

      return null
    }

    const wrapper = mount(<Test />)

    expect(renders).toBe(2)
    expect(receivedHandle!.loading).toBe(true)
    expect(receivedHandle!.cancelled).toBe(false)
    expect(receivedHandle!.errored).toBe(false)
    expect(receivedHandle!.result).toBe(undefined)
    expect(receivedHandle!.error).toBe(undefined)

    await act(() => {
      receivedHandle.cancel()
      promise.resolve("result")
      return createTimeout(0)
    })

    expect(renders).toBe(4)
    expect(receivedHandle!.loading).toBe(false)
    expect(receivedHandle!.cancelled).toBe(true)
    expect(receivedHandle!.errored).toBe(false)
    expect(receivedHandle!.result).toBe(undefined)
    expect(receivedHandle!.error).toBe(undefined)

    await act(() => {
      receivedHandle.reload(() => "new result")
      return createTimeout(0)
    })

    expect(renders).toBe(6)
    expect(receivedHandle!.loading).toBe(false)
    expect(receivedHandle!.cancelled).toBe(false)
    expect(receivedHandle!.errored).toBe(false)
    expect(receivedHandle!.result).toBe("new result")
    expect(receivedHandle!.error).toBe(undefined)
  })

  it("reloads after resolve", async () => {
    let promise = createPromise()
    let renders = 0
    let receivedHandle: AsyncHandle<any>

    const Test = () => {
      renders++
      receivedHandle = useAsync(() => promise)

      return null
    }

    const wrapper = mount(<Test />)

    expect(renders).toBe(2)
    expect(receivedHandle!.loading).toBe(true)
    expect(receivedHandle!.cancelled).toBe(false)
    expect(receivedHandle!.errored).toBe(false)
    expect(receivedHandle!.result).toBe(undefined)
    expect(receivedHandle!.error).toBe(undefined)

    await act(() => {
      receivedHandle.resolve("resolved result")
      promise.resolve("result")
      return createTimeout(0)
    })

    expect(renders).toBe(4)
    expect(receivedHandle!.loading).toBe(false)
    expect(receivedHandle!.cancelled).toBe(false)
    expect(receivedHandle!.errored).toBe(false)
    expect(receivedHandle!.result).toBe("resolved result")
    expect(receivedHandle!.error).toBe(undefined)

    await act(() => {
      receivedHandle.reload(() => "new result")
      return createTimeout(0)
    })

    expect(renders).toBe(6)
    expect(receivedHandle!.loading).toBe(false)
    expect(receivedHandle!.cancelled).toBe(false)
    expect(receivedHandle!.errored).toBe(false)
    expect(receivedHandle!.result).toBe("new result")
    expect(receivedHandle!.error).toBe(undefined)
  })

  it("reload can be awaited", async () => {
    let renders = 0
    let receivedHandle: AsyncHandle<any>

    const Test = () => {
      renders++
      receivedHandle = useAsync()

      return null
    }

    const wrapper = mount(<Test />)

    expect(renders).toBe(1)
    expect(receivedHandle!.loading).toBe(false)
    expect(receivedHandle!.cancelled).toBe(false)
    expect(receivedHandle!.errored).toBe(false)
    expect(receivedHandle!.result).toBe(undefined)
    expect(receivedHandle!.error).toBe(undefined)

    let awaitedResult

    await act(async () => {
      awaitedResult = await receivedHandle.reload(() => "resolved result")
      return createTimeout(0)
    })

    expect(renders).toBe(3)
    expect(receivedHandle!.loading).toBe(false)
    expect(receivedHandle!.cancelled).toBe(false)
    expect(receivedHandle!.errored).toBe(false)
    expect(receivedHandle!.result).toBe("resolved result")
    expect(receivedHandle!.error).toBe(undefined)
    expect(awaitedResult).toBe("resolved result")
  })

  it("resolves directly", async () => {
    let promise = createPromise()
    let renders = 0
    let receivedHandle: AsyncHandle<any>

    const Test = () => {
      renders++
      receivedHandle = useAsync(() => promise)

      return null
    }

    const wrapper = mount(<Test />)

    expect(renders).toBe(2)
    expect(receivedHandle!.loading).toBe(true)
    expect(receivedHandle!.cancelled).toBe(false)
    expect(receivedHandle!.errored).toBe(false)
    expect(receivedHandle!.result).toBe(undefined)
    expect(receivedHandle!.error).toBe(undefined)

    act(() => {
      receivedHandle.resolve("resolved result")
    })

    expect(renders).toBe(3)
    expect(receivedHandle!.loading).toBe(false)
    expect(receivedHandle!.cancelled).toBe(false)
    expect(receivedHandle!.errored).toBe(false)
    expect(receivedHandle!.result).toBe("resolved result")
    expect(receivedHandle!.error).toBe(undefined)
  })
})
