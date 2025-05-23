const root = document.getElementById("root");
const table = document.createElement("table");
const tbody = document.createElement("tbody");

function onClick(event) {
  const td = event.currentTarget;
  const textNode = td.childNodes[0];
  const text = textNode.textContent;
  const input = document.createElement("input");
  input.value = text;
  td.appendChild(input);
  td.removeChild(textNode);
  //td.replaceChild(input, textNode);
  td.removeEventListener("click", onClick);
}

table.appendChild(tbody);
for (let rowIndex = 0; rowIndex < 5; rowIndex++) {
  const tr = document.createElement("tr");
  tbody.appendChild(tr);
  for (let colIndex = 0; colIndex < 5; colIndex++) {
    const td = document.createElement("td");
    tr.appendChild(td);
    const text = document.createTextNode("Default");
    td.appendChild(text);

    td.addEventListener("click", onClick);
  }
}
root.appendChild(table);
