export async function getHistoryChats(): Promise<Chat[]> {
  const response = await fetch("https://api.example.com/history");
  const data = await response.json();
  return data as Chat[];
}

export async function getChatResponse(question = "") {
  console.log("question: ", question);
  const response = await fetch("https://api.example.com/history");
  const data = await response.json();
  return data as any;
}
