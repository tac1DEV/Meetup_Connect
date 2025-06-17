/*
Simulation d’appels serveurs
Créer une Promise getStudents qui récupère une liste d’étudiants entre 1 et 2 secondes
EX: [ { name: "Dupont", cours: [ 1, 3, 5 ] }, { name: "Lea", cours: [ 2, 4 ] }, { name: "Charles", cours: [ 1 ] } ]
Créer une Promise getCourses qui récupère une liste de cours entre 2 et 4 secondes
EX: [ { id: 1, name: "JS" }, { id: 2, name: "PHP" }, { id: 3, name: "C#" }, { id: 4, name: "F#" }, { id: 5, name: "CSS" } ]
Créer une Promise qui mappe à l’ensemble des étudiants les cours associés entre 1 et 4 secondes
EX: [ { name: "Lea", cours: [ { id: 2, name: "PHP" }, { id: 4, name: "F#" } ] }, … ]
Créer une Promise qui contrôle le temps d’accès global
Celle-ci doit rejeter si le temps max dépasse 7 secondes
Afficher la fonction et le temps estimé pour chaque Promise
EX: "getStudents:2"
Afficher "Merge OK" si tout s’est bien passé sinon "Timeout"
*/
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getStudents() {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve([
        { name: "Dupont", cours: [1, 3, 5] },
        { name: "Lea", cours: [2, 4] },
        { name: "Charles", cours: [1] },
      ]);
    }, randomInt(1, 2) * 1000);
  });
}
function getCourses() {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve([
        { id: 1, name: "JS" },
        { id: 2, name: "PHP" },
        { id: 3, name: "C#" },
        { id: 4, name: "F#" },
        { id: 5, name: "CSS" },
      ]);
    }, randomInt(2, 4) * 1000);
  });
}

function mapStudents(students, courses) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(
        students.map((student) => {
          student.cours = student.cours.map((coursId) =>
            courses.find((cours) => cours.id === coursId)
          );

          return student;
        })
      );
    }, randomInt(1, 4));
  });
}

function main() {
  return Promise.all([getStudents(), getCourses()])
    .then((result) => {
      const students = result[0];
      const courses = result[1];
      return mapStudents(students, courses);
    })
    .then((result) => {
      console.log(result);
      // return result
    });
}

function timer() {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      //resolve();
      reject();
    }, 7 * 1000);
  });
}

Promise.race([main(), timer()])
  .then(() => {
    //if (result === undefined) return console.log("Timeout");
    console.log("Merge OK");
  })
  .catch(() => console.log("Timeout"));
