import FluidStore, { INVALID } from "..";

test("listener is called when value changes", async () => {
  const storeDef = [
    { name: "a", value: 2 },
    { name: "b", resolver: () => Promise.resolve(3) },
    {
      name: "sum",
      params: ["a", "b"],
      resolver: (a, b) => a + b,
    },
  ];
  const onBChange = jest.fn();
  const onSumChange = jest.fn();
  const store = new FluidStore(storeDef);
  store.addListener("b", onBChange);
  store.addListener("sum", onSumChange);

  const sum = await store.get("sum");
  expect(sum).toBe(5);

  expect(onBChange).toHaveBeenCalledTimes(1);
  expect(onBChange).toHaveBeenCalledWith(3);
  expect(onSumChange).toHaveBeenCalledTimes(1);
  expect(onSumChange).toHaveBeenCalledWith(5);

  store.invalidate("sum");
  expect(onBChange).toHaveBeenCalledTimes(1);
  expect(onSumChange).toHaveBeenCalledTimes(2);
  expect(onSumChange).toHaveBeenCalledWith(INVALID);

  await store.get("sum");
  expect(onBChange).toHaveBeenCalledTimes(1);
  expect(onSumChange).toHaveBeenCalledTimes(3);
  expect(onSumChange).toHaveBeenCalledWith(5);

  store.set("a", 4);
  expect(onBChange).toHaveBeenCalledTimes(1);
  expect(onSumChange).toHaveBeenCalledTimes(4);
  expect(onSumChange).toHaveBeenCalledWith(INVALID);

  await store.get("sum");
  expect(onBChange).toHaveBeenCalledTimes(1);
  expect(onSumChange).toHaveBeenCalledTimes(5);
  expect(onSumChange).toHaveBeenCalledWith(7);

  store.invalidate("b");
  expect(onBChange).toHaveBeenCalledTimes(2);
  expect(onBChange).toHaveBeenCalledWith(INVALID);
  expect(onSumChange).toHaveBeenCalledTimes(6);
  expect(onSumChange).toHaveBeenCalledWith(INVALID);
});
