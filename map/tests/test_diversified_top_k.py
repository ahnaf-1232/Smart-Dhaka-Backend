# File: tests/test_diversified_top_k.py
# Test cases for the diversified top-k algorithm
import unittest
from src.models.diversified_top_k_shortest_paths import DiversifiedTopKShortestPaths

class TestDiversifiedTopKShortestPaths(unittest.TestCase):
    def setUp(self):
        self.graph = {
            1: [(2, 1), (3, 2)],
            2: [(4, 2)],
            3: [(4, 1)],
            4: [(5, 3)],
            5: []
        }
        self.similarity_threshold = 0.5
        self.k = 2
        self.dtksp = DiversifiedTopKShortestPaths(self.graph, self.similarity_threshold, self.k)

    def test_shortest_paths(self):
        paths = self.dtksp.find_shortest_paths(1, 5)
        self.assertEqual(len(paths), 3)  # Adjust based on graph structure
        self.assertIn([1, 2, 4, 5], paths)
        self.assertIn([1, 3, 4, 5], paths)

    def test_diversified_paths(self):
        paths = self.dtksp.diversified_top_k_paths(1, 5)
        self.assertLessEqual(len(paths), self.k)

if __name__ == '__main__':
    unittest.main()
