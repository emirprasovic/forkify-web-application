import { TIMEOUT_SEC } from "./config.js";

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

export const AJAX = async function (url, uploadData = undefined) {
  try {
    const fetchPro = uploadData
      ? fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(uploadData),
        })
      : fetch(url);

    const response = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
    const data = await response.json();
    if (!response.ok)
      throw new Error(`${data.message} STATUS:${response.status}`);
    return data;
  } catch (error) {
    throw error; // ovdje throwamo error kako bismo ga mogli u model.js handleati
  }
};

export const getJSON = async function (url) {
  try {
    const response = await Promise.race([fetch(url), timeout(TIMEOUT_SEC)]);
    if (!response.ok) throw new Error("Could not fetch recipe. Check your URL");
    const data = await response.json();
    return data;
  } catch (error) {
    throw error; // ovdje throwamo error kako bismo ga mogli u model.js handleati
  }
};

export const sendJSON = async function (url, uploadData) {
  try {
    const response = await Promise.race([
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(uploadData),
      }),
      timeout(TIMEOUT_SEC),
    ]);
    const data = await response.json();
    if (!response.ok)
      throw new Error(`ERROR: ${data.message} (${response.status})`);
    return data;
  } catch (error) {
    throw error; // ovdje throwamo error kako bismo ga mogli u model.js handleati
  }
};
