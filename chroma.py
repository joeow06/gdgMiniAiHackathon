import uuid

import chromadb

COLLECTIONNAME = "ChatHistory"

# Path for Client and The Local Storage
chroma_client = chromadb.PersistentClient(path="./chroma_client")
chatHistory = chroma_client.get_or_create_collection(name=COLLECTIONNAME)


# Update Persistent Chat Record, Stored in Random ID
def UpdateChatHistory(conversationDetails):
    id = str(uuid.uuid4())
    chatHistory.upsert(documents=str(conversationDetails), ids=id)


def QueryResults(prompt):
    results = chatHistory.query(
        query_texts=[prompt],
        n_results=3,
    )

    # No Data Yet
    if len(results["ids"][0]) <= 0:
        print("The result IDs are ", results["ids"])
        return ""

    return results


def ClearCollection():
    allIds = chatHistory.get()["ids"]
    if len(allIds) > 0:
        chatHistory.delete(ids=allIds)
    else:
        print("Nothing to Delete")
