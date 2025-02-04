const colors = [
  "red",
  "green",
  "blue",
  "yellow",
  "black",
  "white",
  "purple",
  "orange",
  "pink",
  "brown",
];

console.log("for acc increment");
for (let i = 0; i < colors.length; i++) {
  const value = colors[i];
  console.log(value);
}
console.log("\nfor acc decrement");
for (let i = colors.length - 1; i >= 0; i--) {
  const value = colors[i];
  console.log(value);
}

console.log("\nfor in (array)");
for (let i in colors) {
  console.log(i, colors[i]);
}
console.log("\nfor of");
for (let value of colors) {
  console.log(value);
}

const voiture = {
  motor: "1.2L",
  brand: "Renault",
  model: "Captur",
};

console.log("\nfor in (object)");
for (let i in voiture) {
  console.log(i, voiture[i]);
}

// for (let value of voiture) {      ====> Erreur voiture is not iterable
//   console.log(value);
// }
const limit = 0;

let i = 0;
console.log("\ndo-while");
do {
  console.log(colors[i]);
  i++;
} while (i < limit);
i = 0;
console.log("\nwhile");
while (i < limit) {
  console.log(colors[i]);
  i++;
}

for (i = 0; i < colors.length; i++) {
  if (colors[i] === "white") break;
}
console.log(`\nWhite found at index ${i} => position ${i + 1}\n`);

for (i = 0; i < colors.length; i++) {
  if (i % 2 !== 0 || colors[i].startsWith("b")) continue;
  console.log(`${i} => ${colors[i]}`);
}
