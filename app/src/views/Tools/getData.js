import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/assets/firebase.init';

export const getDailyTargetSum = async (yearMonth) => {
  let total = 0;
  const colRef = collection(db, "daily_target", yearMonth, "target");
  const querySnapshot = await getDocs(colRef);
  querySnapshot.forEach(doc => {
    total += Number(doc.data().day_target);
  });
  return total;
};