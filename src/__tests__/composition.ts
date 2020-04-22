import FluidStore, { INVALID } from "..";

test("can get value from nested store", async () => {
  const nestedStoreDef = [{ name: "c", resolver: () => Promise.resolve(3) }];
  const storeDef = [
    { name: "a", value: 2 },
    { name: "b", store: nestedStoreDef },
    // {
    //   name: "sum",
    //   params: ["a", "b.c"],
    //   resolver: (a, b) => a + b,
    // },
  ];
  const store = new FluidStore(storeDef);
  const b = await store.get("b");
  expect(b).toBeInstanceOf(FluidStore);
  const c1 = await (await store.get("b")).get("c");
  expect(c1).toBe(3);

  const c2 = await store.get("b.c");
  expect(c2).toBe(3);
});

// test("can map values in a nested store", async () => {
//   const nestedStoreDef = [
//     { name: "customerId", value: null },
//     {
//       name: "name",
//       params: ["customerId"],
//       resolver: (id) => `customer ${id}`,
//     },
//   ];

//   const storeDef = [
//     { name: "a", value: 2 },
//     { name: "b", store: nestedStoreDef, map: {} },
//     {
//       name: "sum",
//       params: ["a", "b.c"],
//       resolver: (a, b) => a + b,
//     },
//   ];
//   const store = new FluidStore(storeDef);
//   const b = await this.get("b");
//   expect(b).toBeInstanceOf(FluidStore);

//   const c1 = await this.get("b").get("c");
//   expect(c1).toBe(3);

//   const c2 = this.get("b.c");
//   expect(c2).toBe(3);
// });
