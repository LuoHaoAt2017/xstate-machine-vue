import { setup, fromPromise, assign, assertEvent } from "xstate";

type Chat = {};

async function getHistoryChats(): Promise<Chat[]> {
  const response = await fetch("https://api.example.com/history");
  const data = await response.json();
  return data as Chat[];
}

export const chatMachine = setup({
  types: {} as {
    context: { chats: Chat[]; question: string };
    events: { type: "FETCH" };
  },
  actors: {
    fetchChatList: fromPromise(async () => {
      return getHistoryChats();
    }),
  },
}).createMachine({
  context: {
    chats: [],
    question: "",
  },
  initial: "idle",
  states: {
    idle: {
      on: {
        FETCH: "loading",
      },
    },
    loading: {
      invoke: {
        src: "fetchChatList",
        onDone: {
          target: "resolved",
          actions: assign({
            chats: ({ event }) => event.output,
          }),
        },
        onError: {
          target: "rejected",
          actions: assign({
            chats: [],
          }),
        },
      },
    },
    resolved: {
      always: {
        target: "idle",
      },
    },
    rejected: {
      always: {
        target: "idle",
      },
    },
  },
});
