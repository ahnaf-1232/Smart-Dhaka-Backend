import osmnx as ox
import json
from tqdm import tqdm

def load_osmnx_data(city_name):
    # Load the street network for Dhaka
    graph = ox.graph_from_place(city_name, network_type='drive')
    print(graph)

    # Convert graph to data
    nodes = graph.nodes(data=True)
    edges = graph.edges(data=True)

    # Create node data structure with a progress bar
    nodes_data = {}
    for node, data in tqdm(nodes, desc="Processing Nodes", unit="node"):
        nodes_data[node] = {
            "name": f"Node {node}",
            "location": [data['y'], data['x']]
        }

    # Create edge data structure with a progress bar
    edges_data = {}
    for from_node, to_node, data in tqdm(edges, desc="Processing Edges", unit="edge"):
        if from_node not in edges_data:
            edges_data[from_node] = {}
        edges_data[from_node][to_node] = data['length']

    # Create final data structure
    data = {
        "nodes": nodes_data,
        "edges": edges_data
    }

    # Clear existing content and save to JSON file
    with open('../../data/raw/dhaka_osmnx_data.json', 'w') as f:
        json.dump(data, f, indent=4)

if __name__ == "__main__":
    load_osmnx_data("Dhaka, Bangladesh")
    print("OSM data loaded and saved to dhaka_osmnx_data.json")
