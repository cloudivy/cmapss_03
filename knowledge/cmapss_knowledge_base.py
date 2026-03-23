"""
NASA CMAPSS RAG Knowledge Base Loader
=======================================
Loads the 10 real CMAPSS knowledge documents into ChromaDB
so the Diagnosis and Maintenance agents can query them.

Called by simulate.py when --dataset cmapss is used.
"""

import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from data.cmapss_knowledge import get_cmapss_knowledge_docs

CMAPSS_RAG_DIR = os.path.join(os.path.dirname(__file__), "..", "rag_data_cmapss")


def load_cmapss_knowledge_base(rag_store=None):
    """
    Load CMAPSS knowledge documents into a RAG store.
    If rag_store is None, creates a new ChromaDB store.
    Returns the populated rag_store.
    """
    from rag.rag_store import RAGStore

    if rag_store is None:
        rag_store = RAGStore(persist_dir=CMAPSS_RAG_DIR)

    docs = get_cmapss_knowledge_docs()

    # Check if already loaded
    try:
        existing = rag_store.collection.count()
        if existing >= len(docs):
            return rag_store
    except Exception:
        pass

    for doc in docs:
        rag_store.add_document(
            doc_id=doc["doc_id"],
            content=doc["content"],
            metadata={
                **doc.get("metadata", {}),
                "title":  doc.get("title", ""),
                "source": doc.get("source", ""),
                "type":   doc.get("type", ""),
            }
        )

    return rag_store


def get_cmapss_rag_dir() -> str:
    return CMAPSS_RAG_DIR
