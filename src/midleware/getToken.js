import { auth } from '../firebase/firebase'; // nơi bạn đã khai báo getAuth(app)

export const getIdToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  } else {
    throw new Error('User is not authenticated');
  }
};