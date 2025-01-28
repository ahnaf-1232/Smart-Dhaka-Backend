# models/node_graph.py

class NodeGraph:
    def __init__(self):
        self.nodes = {}

    def add_node(self, node_id: str, name: str, location: list):
        self.nodes[node_id] = {"name": name, "location": location}

    def find_nearest_node(self, lat: float, lon: float) -> str:
        nearest_node_id = None
        min_distance = float('inf')

        for node_id, node_data in self.nodes.items():
            node_lat, node_lon = node_data['location']
            distance = ((node_lat - lat) ** 2 + (node_lon - lon) ** 2) ** 0.5  # Euclidean distance

            if distance < min_distance:
                min_distance = distance
                nearest_node_id = node_id

        return nearest_node_id
