import FluidStore from "..";

test("store resolves a value from definition", async () => {
  const storeDef = [{ name: "test", resolver: () => "test-value" }];
  const store = new FluidStore(storeDef);
  const value = await store.get("test");
  expect(value).toBe("test-value");
});

test("store resolves an async value from definition", async () => {
  const storeDef = [
    { name: "test", resolver: () => Promise.resolve("test-value") },
  ];
  const store = new FluidStore(storeDef);
  const value = await store.get("test");
  expect(value).toBe("test-value");
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

test("store computes a value from multiple async dependencies", async () => {
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

test("store gets nested value of a computed property using a path", async () => {
  const cat = { name: "Kipper" };
  const storeDef = [
    {
      name: "cat",
      resolver: () => Promise.resolve(cat),
    },
  ];
  const store = new FluidStore(storeDef);
  const value = await store.get("cat");
  expect(value).toBe(cat);

  const name = await store.get("cat.name");
  expect(name).toBe(cat.name);
});
