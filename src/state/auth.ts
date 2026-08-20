export const authState: { token: string | null } = {
  token: null,
};

export function setToken(token: string) {
  authState.token = token;
}
