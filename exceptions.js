function validateUserData(requestData) {
  const errors = {};
  if (!requestData.email) {
    errors.email = "Email is required";
  }
  if (!requestData.password) {
    errors.password = "Password is required";
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }
}

function dbConnect() {
  if (Math.floor(Math.random() * 5) === 4) {
    throw new DatabaseError("Impossible to connect ");
  }
}

function insertUser(data) {
  const emails = ["karl@eemi.com"];
  if (Math.floor(Math.random() * 5) === 4) {
    throw new DatabaseError("Impossible to connect ");
  }
  if (emails.includes(data.email)) {
    throw new ValidationError({
      email: "Already exists",
    });
  }

  return Math.floor(Math.random() * 1000);
}

function fetchUser(lastId) {
  if (Math.floor(Math.random() * 5) === 4) {
    throw new DatabaseError("Impossible to connect ");
  }

  return {
    id: lastId,
    email: "fjezfoez@joijhio.com",
  };
}

function send(data, code) {
  console.log(code, data);
}

//function createUser(requestData) {
//  const isVerified = validateUserData(requestData);
//  if (isVerified) {
//    const isConnected = dbConnect();
//    if (isConnected) {
//      const lastId = insertUser(requestData);
//      if (lastId) {
//        const user = fetchUser(lastId);
//        if (user) {
//          send(user, 201);
//          return;
//        } else {
//          console.error("Impossible to fetch User");
//        }
//      } else if (lastId === -1) {
//        send(
//          {
//            email: "Already exists",
//          },
//          422
//        );
//        console.error("Impossible to insert : email already exist");
//      } else {
//        console.error("Impossible to insert user into the database");
//      }
//    } else {
//      console.error("Database not connected");
//    }
//  } else {
//    console.error("Invalid data");
//  }
//  send(undefined, 500);
//}
function ValidationError(errors) {
  const instance = new Error("Validation error: " + JSON.stringify(errors));
  instance.name = "ValidationError";
  instance.errors = errors;
  Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
  if (Error.captureStackTrace) {
    Error.captureStackTrace(instance, ValidationError);
  }
  return instance;
}
function DatabaseError(msg) {
  const instance = new Error(msg);
  instance.name = "DatabaseError";
  Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
  if (Error.captureStackTrace) {
    Error.captureStackTrace(instance, DatabaseError);
  }
  return instance;
}

function createUser(requestData) {
  try {
    validateUserData(requestData);
    dbConnect();
    const lastId = insertUser(requestData);
    const user = fetchUser(lastId);
    send(user, 201);
  } catch (error) {
    if (error instanceof ValidationError) {
      send(error.errors, 422);
    } else {
      throw error;
    }
  } finally {
    console.log("Problème request: Je suis toujours là ^^^^^^");
  }
}

try {
  createUser({ password: "fergtb" });
} catch (error) {
  send(error.message, 500);
}
