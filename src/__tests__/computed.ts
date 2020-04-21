import FluidStore from "..";

test("store computes a value", async () => {
  expect(null).toBeNull();
});

test("store computes a value", async () => {
  const storeDef = [
    { name: "count", value: 2 },
    {
      name: "doubleCount",
      params: ["count"],
      resolver: (count) => count * 2,
    },
  ];
  const store = new FluidStore(storeDef);
  const count = await store.get("count");
  expect(count).toBe(2);
  const doubleCount = await store.get("doubleCount");
  expect(doubleCount).toBe(4);
});

test("store computes a value from an async dependency", async () => {
  const storeDef = [
    { name: "count", resolver: () => Promise.resolve(3) },
    {
      name: "doubleCount",
      params: ["count"],
      resolver: (count) => count * 2,
    },
  ];
  const store = new FluidStore(storeDef);
  const count = await store.get("count");
  expect(count).toBe(3);
  const doubleCount = await store.get("doubleCount");
  expect(doubleCount).toBe(6);
});

test("store computes a value from multiple async dependency", async () => {
  const storeDef = [
    { name: "a", resolver: () => Promise.resolve(2) },
    { name: "b", resolver: () => Promise.resolve(3) },
    {
      name: "sum",
      params: ["a", "b"],
      resolver: (a, b) => a + b,
    },
  ];
  const store = new FluidStore(storeDef);
  const sum = await store.get("sum");
  expect(sum).toBe(5);
});
