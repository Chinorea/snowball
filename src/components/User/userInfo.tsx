let currentUserEmail: string = "";

export const setCurrentUserEmail = (email: string) =>{
  currentUserEmail = email;
}

export const getCurrentUserEmail = () => {
  return currentUserEmail;
}

export const clearCurrentUserEmail = () => {
    currentUserEmail = "";
}