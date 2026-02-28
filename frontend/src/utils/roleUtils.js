export const getRole = () => {
  return localStorage.getItem("role");
};

export const isAdmin = () => getRole() === "ADMIN";
export const isPM = () => getRole() === "PM";
export const isDev = () => getRole() === "DEV";