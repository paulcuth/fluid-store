import FluidStore from "..";

test("store gets value from definition", async () => {
  const storeDef = [{ name: "test", value: "test-value" }];
  const store = new FluidStore(storeDef);
  const value = await store.get("test");
  expect(value).toBe("test-value");
});

test("store gets value previously set", async () => {
  const storeDef = [{ name: "test", value: null }];
  const store = new FluidStore(storeDef);
  const value = await store.get("test");
  expect(value).toBeNull();

  store.set("test", "new-value");
  const value2 = await store.get("test");
  expect(value2).toBe("new-value");
});

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
