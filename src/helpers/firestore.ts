import { query, collection, getDocs, where, limit } from "firebase/firestore";
import { firestore } from "../firebase/clientApp";

export const getMySnippets = async (userId: string) => {
  const snippetQuery = query(
    collection(firestore, `users/${userId}/communitySnippets`)
  );

  const snippetDocs = await getDocs(snippetQuery);
  return snippetDocs.docs.map((doc) => ({ ...doc.data() }));
};

export const getUserSnippets = async (email: string) => {
  console.log("getUserSnippets - Email:", email);

  const snippetQuery = query(
    collection(firestore, "users"),
    where("email", "==", email),
    limit(1)
  );

  const snippetDocs = await getDocs(snippetQuery);
  return snippetDocs.docs.map((doc) => ({ ...doc.data() }));
};
