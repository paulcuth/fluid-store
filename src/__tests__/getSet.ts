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

test("store gets nested value using a path", async () => {
  const cat = { name: "Kipper" };
  const storeDef = [
    {
      name: "cat",
      value: cat,
    },
  ];
  const store = new FluidStore(storeDef);
  const value = await store.get("cat");
  expect(value).toBe(cat);

  const name = await store.get("cat.name");
  expect(name).toBe(cat.name);
});

test("store gives precedence to node names over nested values", async () => {
  const storeDef = [
    {
      name: "test",
      value: {
        a: 1,
        b: 2,
        c: {
          d: 4,
        },
      },
    },
    {
      name: "test.b",
      value: "hello",
    },
    {
      name: "test.c",
      value: {
        d: 99,
      },
    },
  ];
  const store = new FluidStore(storeDef);
  const value = await store.get("test");
  expect(value.a).toBe(1);
  expect(value.b).toBe(2);

  const a = await store.get("test.a");
  const b = await store.get("test.b");
  expect(a).toBe(1);
  expect(b).toBe("hello");

  const d = await store.get("test.c.d");
  expect(d).toBe(99);
});
