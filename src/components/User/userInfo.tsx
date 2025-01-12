let currentUserEmail: string = "";
let isAdmin: boolean = false;

export const setCurrentUserEmail = (email: string) =>{
  currentUserEmail = email;
}

export const getCurrentUserEmail = () => {
  return currentUserEmail;
}

export const clearCurrentUserEmail = () => {
    currentUserEmail = "";
}

export const setIsAdmin = () => {
  isAdmin = true;
}

export const setIsUser = () => {
  isAdmin = false;
}

export const getIsAdmin = () => {
  return isAdmin;
}