import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server";

export const auth = {
  getSession: async () => {
    const user = await currentUser();
    if (!user) return { data: null, error: null };
    return {
      data: {
        session: {},
        user: {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          name: user.fullName,
        },
      },
      error: null,
    };
  },
};

export { clerkAuth, currentUser };
