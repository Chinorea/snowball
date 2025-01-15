let currentUserEmail: string = "";
let isAdmin: boolean = false;
let profilePicture: string = "/img/default_profile_image.png";

export const setCurrentProfileImage = (image: string) => {
  profilePicture = image;
}

export const getCurrentProfileImage = () => {
  return profilePicture;
}

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
