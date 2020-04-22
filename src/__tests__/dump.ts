import FluidStore, { INVALID } from "..";

test("store dumps raw state correctly", async () => {
  const storeDef = [
    { name: "a", value: 2 },
    { name: "b", resolver: () => Promise.resolve(3) },
    { name: "c", value: null },
    {
      name: "sum",
      params: ["a", "b"],
      resolver: (a, b) => a + b,
    },
  ];
  const store = new FluidStore(storeDef);
  const dump1 = store.dump();
  expect(dump1.a).toBe(2);
  expect(dump1.b).toBe(INVALID);
  expect(dump1.c).toBeNull();
  expect(dump1.sum).toBe(INVALID);

  const sum = await store.get("sum");
  expect(sum).toBe(5);

  const dump2 = store.dump();
  expect(dump2.a).toBe(2);
  expect(dump2.b).toBe(3);
  expect(dump2.sum).toBe(5);

  store.invalidate("b");
  const dump3 = store.dump();
  expect(dump3.b).toBe(INVALID);
  expect(dump3.sum).toBe(INVALID);
});
