import osmnx as ox
import json
from collections import defaultdict
import time
import sys

class Graph:
    def __init__(self):
        self.nodes = {}
        self.edges = defaultdict(dict)

    def add_node(self, node_id, name, location):
        self.nodes[node_id] = {"name": name, "location": location}

    def add_edge(self, from_node, to_node, weight):
        self.edges[from_node][to_node] = weight

    def to_dict(self):
        return {
            "nodes": self.nodes,
            "edges": dict(self.edges)
        }

def load_osmnx_data(city_name):
    print("Loading data...")
    # Load the street network for Dhaka University area
    graph = ox.graph_from_place(city_name, network_type='drive')

    # Convert graph to data
    nodes = graph.nodes(data=True)
    edges = graph.edges(data=True)

    # Create node data structure
    nodes_data = {node: {"name": f"Node {node}", "location": [data['y'], data['x']]} for node, data in nodes}

    # Create edge data structure
    edges_data = {}
    for from_node, to_node, data in edges:
        if from_node not in edges_data:
            edges_data[from_node] = {}
        edges_data[from_node][to_node] = data['length']

    # Create final data structure
    data = {
        "nodes": nodes_data,
        "edges": edges_data
    }

    # Save to JSON file (clearing existing content)
    with open('dhaka_osmnx_data.json', 'w') as f:
        json.dump(data, f, indent=4)

    print("Data loaded and saved to dhaka_osmnx_data.json")

def load_graph(file_path):
    with open(file_path, 'r') as f:
        return json.load(f)

def process_graph_data(data):
    graph = Graph()

    # Process nodes
    for node_id, node_data in data['nodes'].items():
        # Convert to sequential numbering starting from 1
        graph.add_node(str(int(node_id) % 1000 + 1), node_data['name'], node_data['location'])

    # Process edges
    for from_node, edges in data['edges'].items():
        from_node_key = str(int(from_node) % 1000 + 1)
        for to_node, weight in edges.items():
            to_node_key = str(int(to_node) % 1000 + 1)
            graph.add_edge(from_node_key, to_node_key, weight)

    return graph

def save_processed_data(graph, file_path):
    with open(file_path, 'w') as f:
        json.dump(graph.to_dict(), f, indent=4)

if __name__ == "__main__":
    # Load OSMnx data
    load_osmnx_data("Dhaka University, Bangladesh")

    # Load graph data from the JSON file
    graph_data = load_graph('dhaka_osmnx_data.json')

    # Process the loaded data
    dhaka_graph = process_graph_data(graph_data)

    # Save the processed data to another JSON file
    save_processed_data(dhaka_graph, 'processed_dhaka_osmnx_data.json')

    print("Processed OSM data saved to processed_dhaka_osmnx_data.json")