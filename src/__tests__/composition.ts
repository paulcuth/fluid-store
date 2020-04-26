import FluidStore, { INVALID } from "..";

test("can get value from nested store", async () => {
  const nestedStoreDef = [{ name: "c", resolver: () => Promise.resolve(3) }];
  const storeDef = [
    { name: "a", value: 2 },
    { name: "b", store: nestedStoreDef },
  ];
  const store = new FluidStore(storeDef);

  const b = await store.get("b");
  expect(b).toBeInstanceOf(FluidStore);
  const c1 = await (await store.get("b")).get("c");
  expect(c1).toBe(3);

  const c2 = await store.get("b.c");
  expect(c2).toBe(3);
});

test("can compute using values from nested store", async () => {
  const nestedStoreDef = [{ name: "c", value: 3 }];
  const storeDef = [
    { name: "a", value: 2 },
    { name: "b", store: nestedStoreDef },
    {
      name: "sum",
      params: ["a", "b.c"],
      resolver: (a, b) => a + b,
    },
  ];
  const store = new FluidStore(storeDef);
  const sum = await store.get("sum");
  expect(sum).toBe(5);

  store.set("b.c", 10);
  expect(await store.get("b.c")).toBe(10);
  expect(await store.get("sum")).toBe(12);
});

test("can map values in a nested store", async () => {
  const customerStoreDef = [
    { name: "customerId", value: null },
    {
      name: "name",
      params: ["customerId"],
      resolver: (id) => (id == null ? null : `customer ${id}`),
    },
  ];

  const storeDef = [
    {
      name: "selectedCustomerId",
    },
    {
      name: "customer",
      store: customerStoreDef,
      map: { customerId: "selectedCustomerId" },
    },
  ];
  const store = new FluidStore(storeDef);
  expect(await store.get("customer.name")).toBeNull();

  store.set("selectedCustomerId", "123");
  expect(await store.get("customer.name")).toBe("customer 123");

  //   const c1 = await this.get("b").get("c");
  //   expect(c1).toBe(3);

  //   const c2 = this.get("b.c");
  //   expect(c2).toBe(3);
});
