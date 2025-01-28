import json
from config import GRAPH_DATA


def load_graph(file_path: str) -> dict:
    with open(file_path) as f:
        data = json.load(f)

    # Extract edges to create the graph
    graph = {}
    for node, edges in data['edges'].items():
        # Ensure that the graph is structured as required
        graph[node] = [(neighbor, weight) for neighbor, weight in edges.items()]

    return graph

def bfs(graph: dict, start_node: str, target_node: str) -> bool:
    visited = set()
    queue = [start_node]

    while queue:
        current_node = queue.pop(0)

        if current_node == target_node:
            return True
        if current_node not in visited:
            visited.add(current_node)
            # Check if current_node exists in the graph
            if current_node in graph:
                queue.extend(neighbor for neighbor, _ in graph[current_node] if neighbor not in visited)

    return False

if __name__ == "__main__":
    # Load graph data from a JSON file
    graph = load_graph(GRAPH_DATA)

    # Define start and target nodes
    start_node = "265518345"
    target_node = "642632760"

    # Check if there is a path
    if bfs(graph, start_node, target_node):
        print(f"A path exists from {start_node} to {target_node}.")
    else:
        print(f"No path exists from {start_node} to {target_node}.")
