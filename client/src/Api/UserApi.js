const domain = "http://localhost:8000/user";

const Api = {
  signUp: {
    url: `${domain}/signup`,
    method: "post",
  },
  signIn: {
    url: `${domain}/login`,
    method: "post",
  },
};

export default Api;
