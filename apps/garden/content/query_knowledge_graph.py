#!/usr/bin/env python3
"""
Query interface for the Obsidian Knowledge Graph
Provides various ways to explore and query the knowledge stored in Qdrant
"""

import argparse
from typing import List, Dict, Optional
from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchValue
from sentence_transformers import SentenceTransformer
import json
from tabulate import tabulate


class KnowledgeGraphQuery:
    def __init__(self, qdrant_url: str = "localhost", qdrant_port: int = 6333):
        self.qdrant_client = QdrantClient(host=qdrant_url, port=qdrant_port)
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.concepts_collection = "obsidian_concepts"
        self.relationships_collection = "obsidian_relationships"
    
    def semantic_search(self, query: str, limit: int = 10, concept_type: Optional[str] = None) -> List[Dict]:
        """Search for concepts semantically similar to the query"""
        # Create embedding for query
        query_embedding = self.embedding_model.encode(query).tolist()
        
        # Build filter if concept_type specified
        search_filter = None
        if concept_type:
            search_filter = Filter(
                must=[
                    FieldCondition(
                        key="concept_type",
                        match=MatchValue(value=concept_type)
                    )
                ]
            )
        
        # Search
        results = self.qdrant_client.search(
            collection_name=self.concepts_collection,
            query_vector=query_embedding,
            query_filter=search_filter,
            limit=limit
        )
        
        return [
            {
                "score": hit.score,
                "title": hit.payload.get("title"),
                "type": hit.payload.get("concept_type"),
                "content": hit.payload.get("content")[:200] + "...",
                "tags": hit.payload.get("tags", []),
                "source": hit.payload.get("source_file")
            }
            for hit in results
        ]
    
    def get_concept_by_title(self, title: str) -> Optional[Dict]:
        """Get a specific concept by its title"""
        results = self.qdrant_client.scroll(
            collection_name=self.concepts_collection,
            scroll_filter=Filter(
                must=[
                    FieldCondition(
                        key="title",
                        match=MatchValue(value=title)
                    )
                ]
            ),
            limit=1
        )
        
        if results[0]:
            return results[0][0].payload
        return None
    
    def get_relationships(self, concept_id: str, relationship_type: Optional[str] = None) -> List[Dict]:
        """Get all relationships for a concept"""
        # Build filter
        conditions = [
            FieldCondition(
                key="source_id",
                match=MatchValue(value=concept_id)
            )
        ]
        
        if relationship_type:
            conditions.append(
                FieldCondition(
                    key="relationship_type",
                    match=MatchValue(value=relationship_type)
                )
            )
        
        results = self.qdrant_client.scroll(
            collection_name=self.relationships_collection,
            scroll_filter=Filter(must=conditions),
            limit=100
        )
        
        relationships = []
        for point in results[0]:
            rel = point.payload
            # Get target concept details
            target = self.get_concept_by_id(rel["target_id"])
            if target:
                relationships.append({
                    "type": rel["relationship_type"],
                    "target": target.get("title", "Unknown"),
                    "strength": rel["strength"],
                    "context": rel["context"]
                })
        
        return relationships
    
    def get_concept_by_id(self, concept_id: str) -> Optional[Dict]:
        """Get a concept by its ID"""
        try:
            result = self.qdrant_client.retrieve(
                collection_name=self.concepts_collection,
                ids=[concept_id]
            )
            if result:
                return result[0].payload
        except:
            pass
        return None
    
    def get_concepts_by_type(self, concept_type: str, limit: int = 50) -> List[Dict]:
        """Get all concepts of a specific type"""
        results = self.qdrant_client.scroll(
            collection_name=self.concepts_collection,
            scroll_filter=Filter(
                must=[
                    FieldCondition(
                        key="concept_type",
                        match=MatchValue(value=concept_type)
                    )
                ]
            ),
            limit=limit
        )
        
        return [
            {
                "title": point.payload.get("title"),
                "tags": point.payload.get("tags", []),
                "categories": point.payload.get("categories", []),
                "created": point.payload.get("created_at", "")[:10],
                "links": len(point.payload.get("forward_links", [])),
                "backlinks": len(point.payload.get("backlinks", []))
            }
            for point in results[0]
        ]
    
    def get_concepts_by_tag(self, tag: str, limit: int = 50) -> List[Dict]:
        """Get all concepts with a specific tag"""
        # Note: This requires array contains support in Qdrant
        # For now, we'll do client-side filtering
        results = self.qdrant_client.scroll(
            collection_name=self.concepts_collection,
            limit=1000  # Get more and filter client-side
        )
        
        filtered = []
        for point in results[0]:
            if tag in point.payload.get("tags", []):
                filtered.append({
                    "title": point.payload.get("title"),
                    "type": point.payload.get("concept_type"),
                    "categories": point.payload.get("categories", []),
                    "content": point.payload.get("content", "")[:100] + "..."
                })
                if len(filtered) >= limit:
                    break
        
        return filtered
    
    def get_graph_statistics(self) -> Dict:
        """Get overall statistics about the knowledge graph"""
        # Get counts by type
        concept_types = {}
        relationship_types = {}
        
        # Get all concepts
        concepts = self.qdrant_client.scroll(
            collection_name=self.concepts_collection,
            limit=10000
        )[0]
        
        total_tags = set()
        total_categories = set()
        
        for concept in concepts:
            c_type = concept.payload.get("concept_type", "unknown")
            concept_types[c_type] = concept_types.get(c_type, 0) + 1
            
            tags = concept.payload.get("tags", [])
            total_tags.update(tags)
            
            categories = concept.payload.get("categories", [])
            total_categories.update(categories)
        
        # Get all relationships
        relationships = self.qdrant_client.scroll(
            collection_name=self.relationships_collection,
            limit=10000
        )[0]
        
        for rel in relationships:
            r_type = rel.payload.get("relationship_type", "unknown")
            relationship_types[r_type] = relationship_types.get(r_type, 0) + 1
        
        return {
            "total_concepts": len(concepts),
            "total_relationships": len(relationships),
            "concept_types": concept_types,
            "relationship_types": relationship_types,
            "unique_tags": len(total_tags),
            "unique_categories": len(total_categories),
            "tags": sorted(list(total_tags)),
            "categories": sorted(list(total_categories))
        }


def main():
    parser = argparse.ArgumentParser(description="Query the Obsidian knowledge graph")
    parser.add_argument("--qdrant-url", default="localhost", help="Qdrant server URL")
    parser.add_argument("--qdrant-port", type=int, default=6333, help="Qdrant server port")
    
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # Search command
    search_parser = subparsers.add_parser("search", help="Semantic search")
    search_parser.add_argument("query", help="Search query")
    search_parser.add_argument("--type", help="Filter by concept type")
    search_parser.add_argument("--limit", type=int, default=10, help="Number of results")
    
    # Get concept command
    get_parser = subparsers.add_parser("get", help="Get specific concept")
    get_parser.add_argument("title", help="Concept title")
    
    # List by type command
    list_type_parser = subparsers.add_parser("list-type", help="List concepts by type")
    list_type_parser.add_argument("type", help="Concept type")
    list_type_parser.add_argument("--limit", type=int, default=50, help="Number of results")
    
    # List by tag command
    list_tag_parser = subparsers.add_parser("list-tag", help="List concepts by tag")
    list_tag_parser.add_argument("tag", help="Tag name")
    list_tag_parser.add_argument("--limit", type=int, default=50, help="Number of results")
    
    # Stats command
    stats_parser = subparsers.add_parser("stats", help="Show graph statistics")
    
    args = parser.parse_args()
    
    # Initialize query interface
    query = KnowledgeGraphQuery(args.qdrant_url, args.qdrant_port)
    
    if args.command == "search":
        results = query.semantic_search(args.query, args.limit, args.type)
        if results:
            print(f"\nFound {len(results)} results for '{args.query}':\n")
            for i, result in enumerate(results, 1):
                print(f"{i}. {result['title']} ({result['type']}) - Score: {result['score']:.3f}")
                print(f"   Tags: {', '.join(result['tags'])}")
                print(f"   {result['content']}")
                print(f"   Source: {result['source']}\n")
        else:
            print("No results found")
    
    elif args.command == "get":
        concept = query.get_concept_by_title(args.title)
        if concept:
            print(f"\n{concept['title']}")
            print("=" * len(concept['title']))
            print(f"Type: {concept['concept_type']}")
            print(f"Tags: {', '.join(concept['tags'])}")
            print(f"Categories: {', '.join(concept['categories'])}")
            print(f"Created: {concept['created_at'][:10]}")
            print(f"Modified: {concept['modified_at'][:10]}")
            print(f"\nContent:\n{concept['content']}")
            
            # Get relationships
            relationships = query.get_relationships(concept['id'])
            if relationships:
                print(f"\nRelationships ({len(relationships)}):")
                for rel in relationships:
                    print(f"  - {rel['type']} → {rel['target']}")
        else:
            print(f"Concept '{args.title}' not found")
    
    elif args.command == "list-type":
        concepts = query.get_concepts_by_type(args.type, args.limit)
        if concepts:
            print(f"\nFound {len(concepts)} concepts of type '{args.type}':\n")
            headers = ["Title", "Tags", "Categories", "Created", "Links", "Backlinks"]
            rows = [
                [
                    c['title'],
                    len(c['tags']),
                    ', '.join(c['categories'][:2]),
                    c['created'],
                    c['links'],
                    c['backlinks']
                ]
                for c in concepts
            ]
            print(tabulate(rows, headers=headers))
        else:
            print(f"No concepts of type '{args.type}' found")
    
    elif args.command == "list-tag":
        concepts = query.get_concepts_by_tag(args.tag, args.limit)
        if concepts:
            print(f"\nFound {len(concepts)} concepts with tag '#{args.tag}':\n")
            for concept in concepts:
                print(f"- {concept['title']} ({concept['type']})")
                print(f"  Categories: {', '.join(concept['categories'])}")
                print(f"  {concept['content']}\n")
        else:
            print(f"No concepts with tag '#{args.tag}' found")
    
    elif args.command == "stats":
        stats = query.get_graph_statistics()
        print("\nKnowledge Graph Statistics")
        print("=" * 30)
        print(f"Total Concepts: {stats['total_concepts']}")
        print(f"Total Relationships: {stats['total_relationships']}")
        print(f"Unique Tags: {stats['unique_tags']}")
        print(f"Unique Categories: {stats['unique_categories']}")
        
        print("\nConcept Types:")
        for c_type, count in sorted(stats['concept_types'].items(), key=lambda x: x[1], reverse=True):
            print(f"  - {c_type}: {count}")
        
        print("\nRelationship Types:")
        for r_type, count in sorted(stats['relationship_types'].items(), key=lambda x: x[1], reverse=True):
            print(f"  - {r_type}: {count}")
        
        print("\nTop Tags:")
        for tag in stats['tags'][:20]:
            print(f"  - #{tag}")
    
    else:
        parser.print_help()


if __name__ == "__main__":
    main()