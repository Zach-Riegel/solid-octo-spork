import * as automerge from "@automerge/automerge/next";
import { TaskDocument } from "./types";
import { useCallback, useEffect, useRef, useState } from "react";
import _ from "lodash";
import * as base64 from "byte-base64";

type MessageDefinitions = {
  requestDoc: {
    message: "requestEntireDoc";
    docName: string;
  };
  sendDoc: {
    message: "sendEntireDoc";
    senderId: string;
    document64: string;
  };
  requestUpdate: {
    // Introduces this instance and re-prompts change requests
    message: "requestUpdate";
    senderId: string;
  };
  sendUpdate: {
    // Sends appropriate updates to all other known instances
    message: "sendUpdate";
    senderId: string;
    targetId: string;
    update64: string;
  };
};

type Message = MessageDefinitions[keyof MessageDefinitions];

const useSyncedDocument = (
  docUrl: string,
  canSendMessages: boolean,
): {
  document: automerge.Doc<TaskDocument> | undefined;
  mutate: (func: automerge.ChangeFn<TaskDocument>) => void;
} => {
  //render tracker
  const [renderCount, setRenderCount] = useState(0);
  const forceRender = useCallback(() => setRenderCount((x) => x + 1), []);

  const doc = useRef<automerge.Doc<TaskDocument>>(undefined);
  const server = useRef<WebSocket>(undefined);

  const messageQueue = useRef<Message[]>([]);

  let initTimeout = useRef<number>(undefined);

  const canSendMessagesRef = useRef(canSendMessages);
  canSendMessagesRef.current = canSendMessages;
  const sendMessage = useCallback((message: Message) => {
    if (server.current?.readyState === 1 && canSendMessagesRef.current) {
      server.current.send(JSON.stringify(message));
    } else {
      messageQueue.current.push(message);
    }
  }, []);

  const isUpdating = useRef<boolean>(false);
  const stopUpdating = useCallback(
    _.debounce(() => (isUpdating.current = false), 1000),
    [],
  );

  const syncStatesRef = useRef<{
    [key: string]: automerge.SyncState;
  }>({});
  useEffect(() => {
    syncStatesRef.current = {};
  }, [canSendMessages]);

  const getSyncStateForActor = useCallback((actorId: string) => {
    return (syncStatesRef.current[actorId] ??= automerge.initSyncState());
  }, []);

  const changeDocument = useCallback(
    (func: automerge.ChangeFn<TaskDocument>) => {
      if (!doc.current) return;
      isUpdating.current = true;
      doc.current = automerge.change(doc.current, func);
      stopUpdating();
      forceRender();
    },
    [stopUpdating, forceRender],
  );

  const receiveMessage = useCallback(
    (event: MessageEvent<any>): void => {
      let messageObj: Message | undefined;
      try {
        messageObj = JSON.parse(event.data);
        messageObj = JSON.parse(messageObj!.message);
        console.log(messageObj?.message);
        switch (messageObj?.message) {
          case "requestEntireDoc": {
            if (!doc.current) return;
            sendMessage({
              message: "sendEntireDoc",
              senderId: automerge.getActorId(doc.current),
              document64: base64.bytesToBase64(automerge.save(doc.current)),
            });
            break;
          }
          case "sendEntireDoc": {
            if (doc.current) return;
            doc.current = automerge.load(
              base64.base64ToBytes(messageObj.document64),
            );
            break;
          }
          case "requestUpdate": {
            if (!doc.current) return;
            const sync = getSyncStateForActor(messageObj.senderId);
            const [newSync, message] = automerge.generateSyncMessage(
              doc.current,
              sync,
            );
            syncStatesRef.current[messageObj.senderId] = newSync;
            if (message)
              sendMessage({
                message: "sendUpdate",
                senderId: automerge.getActorId(doc.current),
                targetId: messageObj.senderId,
                update64: base64.bytesToBase64(message),
              });
            break;
          }
          case "sendUpdate": {
            if (!doc.current) return;
            if (messageObj.targetId !== automerge.getActorId(doc.current))
              return;
            const sync = getSyncStateForActor(messageObj.senderId);
            const [newDoc, newSync] = automerge.receiveSyncMessage(
              doc.current,
              sync,
              base64.base64ToBytes(messageObj.update64),
            );
            syncStatesRef.current[messageObj.senderId] = newSync;
            doc.current = newDoc;
            forceRender();
            break;
          }
        }
      } catch {
        console.warn("Message skipped");
      }
    },
    [forceRender, getSyncStateForActor, sendMessage],
  );

  // Init WS, try to load a document
  useEffect(() => {
    server.current = new WebSocket(
      "wss://cqkz58p5lk.execute-api.us-west-2.amazonaws.com/production/",
    );
    server.current.addEventListener("open", () => {
      // Flush messageQueue
      const messagesToSend = messageQueue.current;
      messageQueue.current = [];
      messagesToSend.forEach(sendMessage);
    });
    server.current.addEventListener("message", receiveMessage);

    sendMessage({
      message: "requestEntireDoc",
      docName: docUrl,
    });
    initTimeout.current = window.setTimeout(() => {
      doc.current = automerge.from<TaskDocument>({
        tasks: [],
      });
      forceRender();
    }, 5000);

    return () => {
      server.current?.close();
    };
  }, [docUrl, receiveMessage, sendMessage]);

  // Schedule regular request update
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (!server.current || !doc.current) return;
      sendMessage({
        message: "requestUpdate",
        senderId: automerge.getActorId(doc.current),
      });
    }, 500);

    return () => {
      window.clearInterval(interval);
    };
  }, [docUrl, sendMessage]);

  return {
    document: doc.current,
    mutate: changeDocument,
  };
};

export default useSyncedDocument;
