# main.py
import json
from config import GRAPH_DATA, SIMILARITY_THRESHOLD, K
from models.diversified_top_k_shortest_paths import DiversifiedTopKShortestPaths
from models.node_finder import NodeGraph  # Import the NodeGraph class

def load_graph(file_path: str) -> (dict, NodeGraph):
    with open(file_path) as f:
        data = json.load(f)

    # Create a NodeGraph instance to hold nodes
    node_graph = NodeGraph()

    # Extract edges to create the graph
    graph = {}
    for node, edges in data['edges'].items():
        graph[node] = [(neighbor, weight) for neighbor, weight in edges.items()]

    # Load nodes into the NodeGraph
    for node_id, node_info in data['nodes'].items():
        node_graph.add_node(node_id, node_info['name'], node_info['location'])

    return graph, node_graph

def find_nearest_node(node_graph: NodeGraph, lat: float, lon: float) -> str:
    return node_graph.find_nearest_node(lat, lon)

if __name__ == "__main__":
    # Load graph data from a JSON file
    graph_data, node_graph = load_graph(GRAPH_DATA)

    # Input latitude and longitude for the origin
    origin_lat = 23.7927
    origin_lon = 90.4182

    target_lat = 23.7346
    target_lon = 90.4011

    # Find the nearest node to the origin
    nearest_origin_node = find_nearest_node(node_graph, origin_lat, origin_lon)
    print(f"Nearest node to origin ({origin_lat}, {origin_lon}): {nearest_origin_node}")

    nearest_target_node = find_nearest_node(node_graph, target_lat, target_lon)
    print(f"Nearest node to origin ({target_lat}, {target_lon}): {nearest_target_node}")

    # Create an instance of the DiversifiedTopKShortestPaths class
    dtksp = DiversifiedTopKShortestPaths(graph_data, SIMILARITY_THRESHOLD, K)

    # Define OD pair (for example, you might want to get this after finding the nearest node)
    start_node = nearest_origin_node  # Use the nearest node as the start node
    target_node = nearest_target_node  # Example target node (string key)

    # Get diversified top-k shortest paths
    paths = dtksp.diversified_top_k_paths(start_node, target_node)

    print("Diversified Top-k Shortest Paths:")
    for path in paths:
        print(path)


