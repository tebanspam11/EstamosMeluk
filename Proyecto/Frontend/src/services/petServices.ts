import { API_URL } from "../config/api.ts";

export const getPets = async () => {
  const res = await fetch(`${API_URL}/pets`);
  return res.json();
};

export const addPet = async (data: { name: string; type: string }) => {
  const res = await fetch(`${API_URL}/pets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return res.json();
};
