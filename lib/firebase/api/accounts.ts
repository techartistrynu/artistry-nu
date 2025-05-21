import { db } from "@/lib/firebase/server";
import { v4 as uuidv4 } from "uuid";

export async function findOrCreateUser(user: { email: string | null | undefined; name?: string | null; image?: string | null; id?: string }) {
  if (!user.email) throw new Error("No email provided");

  const userEmail = user.email.trim().toLowerCase();

  const usersRef = db.collection("users");
  const querySnapshot = await usersRef.where("email", "==", userEmail).get();

  if (!querySnapshot.empty) {
    const existingUser = querySnapshot.docs[0];
    return { id: existingUser.id, ...existingUser.data() };
  }

  const newUserId = user.id || uuidv4();
  await usersRef.doc(newUserId).set({
    id: newUserId,
    email: userEmail,
    name: user.name || "",
    image: user.image || "",
    createdAt: new Date(),
  });

  return {
    id: newUserId,
    email: userEmail,
    name: user.name,
    image: user.image,
    createdAt: new Date(),
  };
}
