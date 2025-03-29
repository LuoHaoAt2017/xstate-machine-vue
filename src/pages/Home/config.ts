import { setup, fromPromise, assign, sendTo, sendParent } from "xstate";
// import type { ActorRef, Snapshot } from "xstate";
import { getHistoryChats, getChatResponse } from "@/service";

const agentMachine = setup({
  types: {} as {
    events: { type: "ASK"; data: string; sender: string };
    context: {
      question: string;
    };
  },
  actors: {
    getResponse: fromPromise(async function ({
      input,
    }: {
      input: { question: string };
    }) {
      return await getChatResponse(input.question);
    }),
  },
}).createMachine({
  id: "agent",
  context: {
    question: "",
  },
  initial: "idle",
  states: {
    idle: {
      on: {
        ASK: {
          target: "loading",
          actions: assign({
            question: ({ event }) => event.data,
          }),
        },
      },
    },
    loading: {
      invoke: {
        src: "getResponse",
        input: ({ context }) => ({ question: context.question }),
        onDone: {
          target: "resolved",
          actions: sendParent({
            type: "REPLY",
            data: "this is answer",
          }),
        },
        onError: {
          target: "rejected",
        },
      },
    },
    resolved: {
      after: {
        50: {
          target: "idle",
        },
      },
    },
    rejected: {
      after: {
        50: {
          target: "idle",
        },
      },
    },
  },
});

export const chatMachine = setup({
  types: {} as {
    context: { chats: Chat[] };
    events:
      | { type: "FETCH" }
      | { type: "PROCESS"; data: string }
      | { type: "REPLY"; data: string };
  },
  actors: {
    agentMachine,
    fetchChatList: fromPromise(async () => {
      return getHistoryChats();
    }),
  },
}).createMachine({
  context: {
    chats: [],
  },
  initial: "idle",
  states: {
    idle: {
      on: {
        FETCH: {
          target: "loading",
        },
        PROCESS: {
          actions: [
            sendTo("agent", ({ self }) => ({
              type: "ASK",
              data: "What should we do about this?",
              sender: self.id,
            })),
          ],
        },
        REPLY: {
          actions: ({ event }) => {
            console.log("receive answer from agent: ", event.data);
          },
        },
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
