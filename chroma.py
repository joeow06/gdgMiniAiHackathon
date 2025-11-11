import chromadb

chroma_client = chromadb.Client()

collection = chroma_client.get_or_create_collection(name="Test_Collection")



# Update Database
collection.upsert(
    documents=["This is a document about dogs", "this is a document about cats"],
    ids=["id1", "id2"],
)

results = collection.query(
    query_texts=["This is a query document about animals"], n_results=2
)

print(results)
